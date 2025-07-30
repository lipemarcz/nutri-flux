import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Download, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MealForm } from './MealForm';
import { NutritionResults } from './NutritionResults';
import { useNutritionCalculator } from '@/hooks/useNutritionCalculator';

export interface Meal {
  id: string;
  name: string;
  protocol: string;
}

export interface NutritionData {
  name: string;
  kcal: number;
  prot: number;
  carb: number;
  lip: number;
  quantity: number;
}

export interface MealResult {
  meal: Meal;
  nutrition: NutritionData[];
  totals: {
    kcal: number;
    prot: number;
    carb: number;
    lip: number;
    quantity: number;
  };
}

export const NutritionCalculator: React.FC = () => {
  const [studentWeight, setStudentWeight] = useState<number>(70);
  const [mealsCount, setMealsCount] = useState<number>(3);
  const [meals, setMeals] = useState<Meal[]>([
    { id: '1', name: 'Café da manhã', protocol: '100g aveia\n200ml leite desnatado\n1 banana' },
    { id: '2', name: 'Almoço', protocol: '150g peito de frango\n100g arroz integral\n80g brócolis' },
    { id: '3', name: 'Jantar', protocol: '120g salmão\n150g batata doce\n50g espinafre' }
  ]);
  
  const { calculateNutrition, isLoading } = useNutritionCalculator();
  const [results, setResults] = useState<MealResult[]>([]);
  const { toast } = useToast();

  const addMeal = () => {
    if (meals.length < 7) {
      const newMeal: Meal = {
        id: Date.now().toString(),
        name: `Refeição ${meals.length + 1}`,
        protocol: ''
      };
      setMeals([...meals, newMeal]);
      setMealsCount(meals.length + 1);
    }
  };

  const removeMeal = (mealId: string) => {
    if (meals.length > 3) {
      setMeals(meals.filter(meal => meal.id !== mealId));
      setMealsCount(meals.length - 1);
    }
  };

  const updateMeal = (mealId: string, updates: Partial<Meal>) => {
    setMeals(meals.map(meal => 
      meal.id === mealId ? { ...meal, ...updates } : meal
    ));
  };

  const handleCalculate = async () => {
    if (!studentWeight || studentWeight <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um peso válido para o aluno.",
        variant: "destructive"
      });
      return;
    }

    const mealsWithProtocol = meals.filter(meal => meal.protocol.trim());
    if (mealsWithProtocol.length === 0) {
      toast({
        title: "Erro", 
        description: "Por favor, adicione pelo menos um protocolo de refeição.",
        variant: "destructive"
      });
      return;
    }

    try {
      const calculatedResults = await calculateNutrition(mealsWithProtocol, studentWeight);
      setResults(calculatedResults);
      
      toast({
        title: "Sucesso",
        description: `Protocolo calculado para ${calculatedResults.length} refeições.`,
      });
    } catch (error) {
      console.error('Error calculating nutrition:', error);
      toast({
        title: "Erro",
        description: "Erro ao calcular nutrição. Verifique os dados e tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="nutrition-shadow">
          <CardHeader className="primary-gradient text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Calculator className="h-6 w-6" />
              Calculadora Nutricional PWA
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Student Weight Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-sm font-medium">
                  Peso do Aluno (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  min="1"
                  max="300"
                  value={studentWeight}
                  onChange={(e) => setStudentWeight(Number(e.target.value))}
                  className="text-lg"
                  placeholder="Ex: 70"
                />
              </div>
              
              {/* Meals Count Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Número de Refeições
                </Label>
                <Select 
                  value={mealsCount.toString()} 
                  onValueChange={(value) => {
                    const count = Number(value);
                    setMealsCount(count);
                    
                    if (count > meals.length) {
                      // Add meals
                      const newMeals = [...meals];
                      for (let i = meals.length; i < count; i++) {
                        newMeals.push({
                          id: Date.now().toString() + i,
                          name: `Refeição ${i + 1}`,
                          protocol: ''
                        });
                      }
                      setMeals(newMeals);
                    } else if (count < meals.length) {
                      // Remove meals
                      setMeals(meals.slice(0, count));
                    }
                  }}
                >
                  <SelectTrigger className="text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} refeições
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meals Form */}
        <Card className="elegant-shadow">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between">
              Protocolos das Refeições
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addMeal}
                  disabled={meals.length >= 7}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {meals.map((meal, index) => (
              <MealForm
                key={meal.id}
                meal={meal}
                index={index}
                onUpdate={updateMeal}
                onRemove={removeMeal}
                canRemove={meals.length > 3}
              />
            ))}
          </CardContent>
        </Card>

        {/* Calculate Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleCalculate}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold nutrition-shadow"
          >
            {isLoading ? (
              "Calculando..."
            ) : (
              <>
                <Calculator className="mr-2 h-5 w-5" />
                Calcular Protocolo
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <NutritionResults 
            results={results} 
            studentWeight={studentWeight}
          />
        )}
      </div>
    </div>
  );
};