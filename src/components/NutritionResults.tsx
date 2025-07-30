import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp } from 'lucide-react';
import type { MealResult } from './NutritionCalculator';
import { exportToPDF } from '@/utils/pdfExport';

interface NutritionResultsProps {
  results: MealResult[];
  studentWeight: number;
}

export const NutritionResults: React.FC<NutritionResultsProps> = ({
  results,
  studentWeight
}) => {
  // Calculate totals across all meals
  const grandTotals = results.reduce(
    (acc, result) => ({
      kcal: acc.kcal + result.totals.kcal,
      prot: acc.prot + result.totals.prot,
      carb: acc.carb + result.totals.carb,
      lip: acc.lip + result.totals.lip,
      quantity: acc.quantity + result.totals.quantity
    }),
    { kcal: 0, prot: 0, carb: 0, lip: 0, quantity: 0 }
  );

  // Calculate percentages and ratios
  const protPerKg = grandTotals.prot / studentWeight;
  const carbPerKg = grandTotals.carb / studentWeight;
  const lipPerKg = grandTotals.lip / studentWeight;

  const protCalories = grandTotals.prot * 4;
  const carbCalories = grandTotals.carb * 4;
  const lipCalories = grandTotals.lip * 9;

  const protPercent = (protCalories / grandTotals.kcal) * 100;
  const carbPercent = (carbCalories / grandTotals.kcal) * 100;
  const lipPercent = (lipCalories / grandTotals.kcal) * 100;

  const handleExportPDF = () => {
    exportToPDF(results, studentWeight, grandTotals);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{grandTotals.kcal.toFixed(0)}</div>
            <div className="text-sm text-muted-foreground">kcal totais</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: 'hsl(var(--protein))' }}>
              {grandTotals.prot.toFixed(1)}g
            </div>
            <div className="text-sm text-muted-foreground">Proteínas</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: 'hsl(var(--carbs))' }}>
              {grandTotals.carb.toFixed(1)}g
            </div>
            <div className="text-sm text-muted-foreground">Carboidratos</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: 'hsl(var(--fats))' }}>
              {grandTotals.lip.toFixed(1)}g
            </div>
            <div className="text-sm text-muted-foreground">Lipídeos</div>
          </CardContent>
        </Card>
      </div>

      {/* Ratios per kg */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Proporções por Peso Corporal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-lg font-semibold" style={{ color: 'hsl(var(--protein))' }}>
                {protPerKg.toFixed(2)} g/kg
              </div>
              <div className="text-sm text-muted-foreground">Proteínas por kg</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-lg font-semibold" style={{ color: 'hsl(var(--carbs))' }}>
                {carbPerKg.toFixed(2)} g/kg
              </div>
              <div className="text-sm text-muted-foreground">Carboidratos por kg</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-lg font-semibold" style={{ color: 'hsl(var(--fats))' }}>
                {lipPerKg.toFixed(2)} g/kg
              </div>
              <div className="text-sm text-muted-foreground">Lipídeos por kg</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Resultados Detalhados por Refeição</CardTitle>
          <Button onClick={handleExportPDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </CardHeader>
        <CardContent>
          <div id="nutrition-table" className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Refeição</th>
                  <th className="text-center p-2 font-semibold" style={{ color: 'hsl(var(--protein))' }}>
                    Proteínas g (%)
                  </th>
                  <th className="text-center p-2 font-semibold" style={{ color: 'hsl(var(--carbs))' }}>
                    Carboidratos g (%)
                  </th>
                  <th className="text-center p-2 font-semibold" style={{ color: 'hsl(var(--fats))' }}>
                    Lipídeos g (%)
                  </th>
                  <th className="text-center p-2 font-semibold" style={{ color: 'hsl(var(--calories))' }}>
                    Calorias kcal (%)
                  </th>
                  <th className="text-center p-2 font-semibold">Quantidade g (%)</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => {
                  const mealProtPercent = (result.totals.prot / grandTotals.prot) * 100;
                  const mealCarbPercent = (result.totals.carb / grandTotals.carb) * 100;
                  const mealLipPercent = (result.totals.lip / grandTotals.lip) * 100;
                  const mealKcalPercent = (result.totals.kcal / grandTotals.kcal) * 100;
                  const mealQuantityPercent = (result.totals.quantity / grandTotals.quantity) * 100;

                  return (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{result.meal.name}</td>
                      <td className="text-center p-2">
                        {result.totals.prot.toFixed(1)} ({mealProtPercent.toFixed(1)}%)
                      </td>
                      <td className="text-center p-2">
                        {result.totals.carb.toFixed(1)} ({mealCarbPercent.toFixed(1)}%)
                      </td>
                      <td className="text-center p-2">
                        {result.totals.lip.toFixed(1)} ({mealLipPercent.toFixed(1)}%)
                      </td>
                      <td className="text-center p-2">
                        {result.totals.kcal.toFixed(0)} ({mealKcalPercent.toFixed(1)}%)
                      </td>
                      <td className="text-center p-2">
                        {result.totals.quantity.toFixed(0)} ({mealQuantityPercent.toFixed(1)}%)
                      </td>
                    </tr>
                  );
                })}
                {/* Totals Row */}
                <tr className="border-t-2 border-primary bg-primary/5 font-semibold">
                  <td className="p-2">TOTAL</td>
                  <td className="text-center p-2">
                    {grandTotals.prot.toFixed(1)} ({protPercent.toFixed(1)}%)
                  </td>
                  <td className="text-center p-2">
                    {grandTotals.carb.toFixed(1)} ({carbPercent.toFixed(1)}%)
                  </td>
                  <td className="text-center p-2">
                    {grandTotals.lip.toFixed(1)} ({lipPercent.toFixed(1)}%)
                  </td>
                  <td className="text-center p-2">
                    {grandTotals.kcal.toFixed(0)} (100%)
                  </td>
                  <td className="text-center p-2">
                    {grandTotals.quantity.toFixed(0)} (100%)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};