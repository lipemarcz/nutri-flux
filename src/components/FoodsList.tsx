import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Apple, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Food {
  id?: number;
  name: string;
  kcal: number;
  prot: number;
  carb: number;
  lip: number;
}

export const FoodsList: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFoods();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = foods.filter(food => 
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFoods(filtered);
    } else {
      setFilteredFoods(foods);
    }
  }, [searchTerm, foods]);

  const fetchFoods = async () => {
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching foods:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar alimentos",
          variant: "destructive"
        });
        return;
      }

      setFoods(data || []);
    } catch (error) {
      console.error('Error fetching foods:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar alimentos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFoodClick = (food: Food) => {
    setSelectedFood(selectedFood?.name === food.name ? null : food);
  };

  return (
    <Card className="elegant-shadow">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Apple className="h-6 w-6 text-primary" />
          Alimentos Disponíveis
        </CardTitle>
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alimentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Info className="h-4 w-4" />
            Clique em um alimento para ver as informações nutricionais
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando alimentos...
          </div>
        ) : (
          <div className="space-y-4">
            <ScrollArea className="h-64">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredFoods.map((food, index) => (
                  <Button
                    key={index}
                    variant={selectedFood?.name === food.name ? "default" : "outline"}
                    className="justify-start text-left h-auto p-3"
                    onClick={() => handleFoodClick(food)}
                  >
                    <div className="flex flex-col items-start w-full">
                      <span className="font-medium">{food.name}</span>
                      <span className="text-xs text-muted-foreground">
                        100g: {food.kcal}kcal
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
            
            {filteredFoods.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                {searchTerm ? 'Nenhum alimento encontrado' : 'Nenhum alimento disponível'}
              </div>
            )}

            {selectedFood && (
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{selectedFood.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Badge variant="secondary" className="w-full justify-center">
                        {selectedFood.kcal} kcal
                      </Badge>
                      <p className="text-sm text-center text-muted-foreground">Energia</p>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline" className="w-full justify-center">
                        {selectedFood.prot}g
                      </Badge>
                      <p className="text-sm text-center text-muted-foreground">Proteína</p>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline" className="w-full justify-center">
                        {selectedFood.carb}g
                      </Badge>
                      <p className="text-sm text-center text-muted-foreground">Carboidrato</p>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline" className="w-full justify-center">
                        {selectedFood.lip}g
                      </Badge>
                      <p className="text-sm text-center text-muted-foreground">Lipídios</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground text-center">
                      💡 Valores por 100g do alimento
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};