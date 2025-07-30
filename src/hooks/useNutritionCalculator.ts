import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Meal, NutritionData, MealResult } from '@/components/NutritionCalculator';

export const useNutritionCalculator = () => {
  const [isLoading, setIsLoading] = useState(false);

  const parseProtocol = (protocol: string): string[] => {
    // Split by semicolon and filter out empty items
    const items = protocol.split(';').map(item => item.trim()).filter(item => item.length > 0);
    
    // Process each item to handle "OU" (OR) alternatives
    const processedItems: string[] = [];
    
    for (const item of items) {
      // Check if item contains "OU" (OR alternatives)
      if (item.toLowerCase().includes(' ou ')) {
        // Split by "OU" and take the first option for calculation
        const alternatives = item.split(/\s+ou\s+/i);
        if (alternatives.length > 0) {
          // Use the first alternative for calculation
          const firstOption = alternatives[0].trim();
          // Clean up any extra characters like "+" at the beginning
          const cleanOption = firstOption.replace(/^\+\s*/, '').trim();
          if (cleanOption) {
            processedItems.push(cleanOption);
          }
        }
      } else {
        // Clean up any extra characters like "+" at the beginning
        const cleanItem = item.replace(/^\+\s*/, '').trim();
        if (cleanItem) {
          processedItems.push(cleanItem);
        }
      }
    }
    
    return processedItems;
  };

  const searchFood = async (foodName: string): Promise<NutritionData | null> => {
    try {
      // Clean the food name for search (remove quantities, units, but preserve main food name)
      let cleanName = foodName
        .replace(/^\d+(?:\.\d+)?\s*(g|kg|ml|l|unidade|unidades|colher|colheres|xícara|xícaras|fatia|fatias)\s*/i, '')
        .replace(/^\d+\s*/i, '') // Remove numbers without units
        .replace(/^de\s+/i, '') // Remove "de" at the beginning
        .trim()
        .toLowerCase();

      console.log('Searching for food:', cleanName, 'from original:', foodName);

      // Search in the foods table using ilike for partial matching
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .ilike('name', `%${cleanName}%`)
        .limit(1);

      if (error) {
        console.error('Supabase error:', error);
        return null;
      }

      if (data && data.length > 0) {
        const food = data[0];
        return {
          name: food.name,
          kcal: food.kcal || 0,
          prot: food.prot || 0,
          carb: food.carb || 0,
          lip: food.lip || 0,
          quantity: 100 // Base quantity in database is per 100g
        };
      }

      console.warn('Food not found:', cleanName);
      return null;
    } catch (error) {
      console.error('Error searching food:', error);
      return null;
    }
  };

  const extractQuantity = (foodItem: string): { quantity: number; unit: string } => {
    const match = foodItem.match(/^(\d+(?:\.\d+)?)\s*(g|kg|ml|l|unidade|unidades|colher|colheres|xícara|xícaras|fatia|fatias)?/i);
    
    if (!match) return { quantity: 100, unit: 'g' };
    
    let quantity = parseFloat(match[1]);
    const unit = match[2]?.toLowerCase() || 'g';
    
    // Convert to grams
    switch (unit) {
      case 'kg':
        quantity *= 1000;
        break;
      case 'l':
        quantity *= 1000; // Assuming density ≈ 1 for liquids
        break;
      case 'ml':
        // Keep as is, assuming density ≈ 1
        break;
      case 'colher':
      case 'colheres':
        quantity *= 15; // Tablespoon ≈ 15g
        break;
      case 'xícara':
      case 'xícaras':
        quantity *= 240; // Cup ≈ 240g
        break;
      case 'unidade':
      case 'unidades':
      case 'fatia':
      case 'fatias':
        quantity *= 50; // Estimate for medium portions
        break;
      default:
        // Already in grams
        break;
    }
    
    return { quantity, unit: 'g' };
  };

  const calculateNutrition = async (meals: Meal[], studentWeight: number): Promise<MealResult[]> => {
    setIsLoading(true);
    const results: MealResult[] = [];

    try {
      for (const meal of meals) {
        const foodItems = parseProtocol(meal.protocol);
        const nutritionData: NutritionData[] = [];
        
        for (const foodItem of foodItems) {
          const { quantity } = extractQuantity(foodItem);
          const foodData = await searchFood(foodItem);
          
          if (foodData) {
            // Calculate nutrition based on actual quantity (database values are per 100g)
            const multiplier = quantity / 100;
            
            nutritionData.push({
              name: foodItem,
              kcal: foodData.kcal * multiplier,
              prot: foodData.prot * multiplier,
              carb: foodData.carb * multiplier,
              lip: foodData.lip * multiplier,
              quantity: quantity
            });
          } else {
            // Add placeholder for foods not found in database
            console.warn(`Food not found in database: ${foodItem}`);
            nutritionData.push({
              name: foodItem + ' (não encontrado)',
              kcal: 0,
              prot: 0,
              carb: 0,
              lip: 0,
              quantity: 0
            });
          }
        }

        // Calculate totals for this meal
        const totals = nutritionData.reduce(
          (acc, item) => ({
            kcal: acc.kcal + item.kcal,
            prot: acc.prot + item.prot,
            carb: acc.carb + item.carb,
            lip: acc.lip + item.lip,
            quantity: acc.quantity + item.quantity
          }),
          { kcal: 0, prot: 0, carb: 0, lip: 0, quantity: 0 }
        );

        results.push({
          meal,
          nutrition: nutritionData,
          totals
        });
      }
    } catch (error) {
      console.error('Error calculating nutrition:', error);
      throw new Error('Erro ao calcular nutrição');
    } finally {
      setIsLoading(false);
    }

    return results;
  };

  return {
    calculateNutrition,
    isLoading
  };
};
