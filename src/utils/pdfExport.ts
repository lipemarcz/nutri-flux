import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { MealResult } from '@/components/NutritionCalculator';

export const exportToPDF = async (
  results: MealResult[],
  studentWeight: number,
  grandTotals: { kcal: number; prot: number; carb: number; lip: number; quantity: number }
) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Relatório Nutricional', pageWidth / 2, 20, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 35);
    pdf.text(`Peso do aluno: ${studentWeight} kg`, 20, 45);
    
    // Summary section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Resumo Nutricional', 20, 65);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    let yPos = 75;
    pdf.text(`Calorias totais: ${grandTotals.kcal.toFixed(0)} kcal`, 20, yPos);
    yPos += 7;
    pdf.text(`Proteínas: ${grandTotals.prot.toFixed(1)} g (${(grandTotals.prot / studentWeight).toFixed(2)} g/kg)`, 20, yPos);
    yPos += 7;
    pdf.text(`Carboidratos: ${grandTotals.carb.toFixed(1)} g (${(grandTotals.carb / studentWeight).toFixed(2)} g/kg)`, 20, yPos);
    yPos += 7;
    pdf.text(`Lipídeos: ${grandTotals.lip.toFixed(1)} g (${(grandTotals.lip / studentWeight).toFixed(2)} g/kg)`, 20, yPos);
    yPos += 7;
    pdf.text(`Quantidade total: ${grandTotals.quantity.toFixed(0)} g`, 20, yPos);
    
    // Macronutrient percentages
    yPos += 15;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Distribuição Calórica dos Macronutrientes:', 20, yPos);
    
    const protCalories = grandTotals.prot * 4;
    const carbCalories = grandTotals.carb * 4;
    const lipCalories = grandTotals.lip * 9;
    
    const protPercent = (protCalories / grandTotals.kcal) * 100;
    const carbPercent = (carbCalories / grandTotals.kcal) * 100;
    const lipPercent = (lipCalories / grandTotals.kcal) * 100;
    
    pdf.setFont('helvetica', 'normal');
    yPos += 10;
    pdf.text(`Proteínas: ${protPercent.toFixed(1)}%`, 20, yPos);
    yPos += 7;
    pdf.text(`Carboidratos: ${carbPercent.toFixed(1)}%`, 20, yPos);
    yPos += 7;
    pdf.text(`Lipídeos: ${lipPercent.toFixed(1)}%`, 20, yPos);
    
    // Meals section
    yPos += 20;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detalhamento por Refeição', 20, yPos);
    
    yPos += 15;
    pdf.setFontSize(10);
    
    // Table headers
    const colWidths = [40, 25, 25, 25, 25, 25];
    const colPositions = [20, 60, 85, 110, 135, 160];
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Refeição', colPositions[0], yPos);
    pdf.text('Prot (g)', colPositions[1], yPos);
    pdf.text('Carb (g)', colPositions[2], yPos);
    pdf.text('Lip (g)', colPositions[3], yPos);
    pdf.text('Kcal', colPositions[4], yPos);
    pdf.text('Qtd (g)', colPositions[5], yPos);
    
    yPos += 7;
    pdf.line(20, yPos - 2, 185, yPos - 2); // Header underline
    
    pdf.setFont('helvetica', 'normal');
    
    // Table data
    results.forEach((result) => {
      if (yPos > pageHeight - 30) {
        pdf.addPage();
        yPos = 20;
      }
      
      const mealProtPercent = (result.totals.prot / grandTotals.prot) * 100;
      const mealCarbPercent = (result.totals.carb / grandTotals.carb) * 100;
      const mealLipPercent = (result.totals.lip / grandTotals.lip) * 100;
      const mealKcalPercent = (result.totals.kcal / grandTotals.kcal) * 100;
      const mealQuantityPercent = (result.totals.quantity / grandTotals.quantity) * 100;
      
      // Truncate meal name if too long
      const mealName = result.meal.name.length > 15 
        ? result.meal.name.substring(0, 12) + '...' 
        : result.meal.name;
      
      pdf.text(mealName, colPositions[0], yPos);
      pdf.text(`${result.totals.prot.toFixed(1)} (${mealProtPercent.toFixed(1)}%)`, colPositions[1], yPos);
      pdf.text(`${result.totals.carb.toFixed(1)} (${mealCarbPercent.toFixed(1)}%)`, colPositions[2], yPos);
      pdf.text(`${result.totals.lip.toFixed(1)} (${mealLipPercent.toFixed(1)}%)`, colPositions[3], yPos);
      pdf.text(`${result.totals.kcal.toFixed(0)} (${mealKcalPercent.toFixed(1)}%)`, colPositions[4], yPos);
      pdf.text(`${result.totals.quantity.toFixed(0)} (${mealQuantityPercent.toFixed(1)}%)`, colPositions[5], yPos);
      
      yPos += 7;
    });
    
    // Totals row
    yPos += 5;
    pdf.line(20, yPos - 2, 185, yPos - 2); // Totals line
    pdf.setFont('helvetica', 'bold');
    pdf.text('TOTAL', colPositions[0], yPos);
    pdf.text(`${grandTotals.prot.toFixed(1)} (${protPercent.toFixed(1)}%)`, colPositions[1], yPos);
    pdf.text(`${grandTotals.carb.toFixed(1)} (${carbPercent.toFixed(1)}%)`, colPositions[2], yPos);
    pdf.text(`${grandTotals.lip.toFixed(1)} (${lipPercent.toFixed(1)}%)`, colPositions[3], yPos);
    pdf.text(`${grandTotals.kcal.toFixed(0)} (100%)`, colPositions[4], yPos);
    pdf.text(`${grandTotals.quantity.toFixed(0)} (100%)`, colPositions[5], yPos);
    
    // Footer
    const currentDate = new Date().toLocaleString('pt-BR');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Gerado pela Calculadora Nutricional PWA em ${currentDate}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Save the PDF
    pdf.save(`relatorio-nutricional-${new Date().toISOString().split('T')[0]}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Erro ao gerar PDF');
  }
};