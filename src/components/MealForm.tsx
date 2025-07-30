import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Minus, Utensils } from 'lucide-react';
import type { Meal } from './NutritionCalculator';

interface MealFormProps {
  meal: Meal;
  index: number;
  onUpdate: (mealId: string, updates: Partial<Meal>) => void;
  onRemove: (mealId: string) => void;
  canRemove: boolean;
}

export const MealForm: React.FC<MealFormProps> = ({
  meal,
  index,
  onUpdate,
  onRemove,
  canRemove
}) => {
  return (
    <Card className="border-l-4 border-l-primary smooth-transition hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            <span>Refeição {index + 1}</span>
          </div>
          {canRemove && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(meal.id)}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`meal-name-${meal.id}`} className="text-sm font-medium">
            Nome da Refeição
          </Label>
          <Input
            id={`meal-name-${meal.id}`}
            value={meal.name}
            onChange={(e) => onUpdate(meal.id, { name: e.target.value })}
            placeholder="Ex: Café da manhã"
            className="font-medium"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`meal-protocol-${meal.id}`} className="text-sm font-medium">
            Protocolo Alimentar
          </Label>
          <Textarea
            id={`meal-protocol-${meal.id}`}
            value={meal.protocol}
            onChange={(e) => onUpdate(meal.id, { protocol: e.target.value })}
            placeholder={`Exemplo:
100g aveia
200ml leite desnatado
1 banana média
15ml azeite`}
            className="min-h-[120px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            💡 Digite cada alimento em uma linha nova. Ex: "100g peito de frango"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};