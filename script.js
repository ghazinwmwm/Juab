function calculateProfit() {
    let capital = parseFloat(document.getElementById("capital").value) || 0;
    let costPerUnit = parseFloat(document.getElementById("cost_per_unit").value) || 0;
    let sellPrice = parseFloat(document.getElementById("sell_price").value) || 0;
    let unitsSold = parseFloat(document.getElementById("units_sold").value) || 0;
    let marketingCosts = parseFloat(document.getElementById("marketing_costs").value) || 0;
    let operationCosts = parseFloat(document.getElementById("operation_costs").value) || 0;

    capital *= 1000;
    costPerUnit *= 1000;
    sellPrice *= 1000;
    marketingCosts *= 1000;
    operationCosts *= 1000;

    let totalCost = (costPerUnit * unitsSold) + marketingCosts + operationCosts;
    let totalRevenue = sellPrice * unitsSold;
    let profit = totalRevenue - totalCost;

    let resultText = profit >= 0 ? `الربح الصافي: ${profit.toLocaleString()} دينار` : `الخسارة: ${Math.abs(profit).toLocaleString()} دينار`;
    document.getElementById("profit_result").innerText = resultText;
}

function suggestPrice() {
    let costPerUnit = parseFloat(document.getElementById("cost_per_unit").value) || 0;
    let marketingCosts = parseFloat(document.getElementById("marketing_costs").value) || 0;
    let operationCosts = parseFloat(document.getElementById("operation_costs").value) || 0;
    let unitsSold = parseFloat(document.getElementById("units_sold").value) || 0;

    if (unitsSold <= 0) {
        document.getElementById("business_suggestion").innerText = "أدخل عدد المبيعات المتوقع لحساب السعر!";
        return;
    }

    costPerUnit *= 1000;
    marketingCosts *= 1000;
    operationCosts *= 1000;

    let totalCostPerUnit = (costPerUnit + (marketingCosts + operationCosts) / unitsSold);
    let suggestedPrice = totalCostPerUnit * 1.3;

    document.getElementById("business_suggestion").innerText = `السعر المقترح لكل منتج: ${suggestedPrice.toLocaleString()} دينار`;
}