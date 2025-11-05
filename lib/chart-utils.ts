interface DataPoint {
  name: string;
  value: number;
  percentage?: number;
}

interface ChartData {
  data: DataPoint[];
  title: string;
  type: 'pie' | 'bar';
}

export function extractNumericalData(text: string): ChartData | null {
  // Remove code blocks to avoid false positives
  const cleanText = text.replace(/```[\s\S]*?```/g, '');
  
  // Patterns to detect numerical data
  const patterns = [
    // Pattern 1: "Category: Number" or "Category - Number"
    /([A-Za-z\s]+?)[:|-]\s*([0-9,]+(?:\.[0-9]+)?)\s*(%|percent|million|billion|thousand|k|m|b)?/gi,
    
    // Pattern 2: "Number% Category" or "Number Category"
    /([0-9,]+(?:\.[0-9]+)?)\s*(%|percent)?\s+([A-Za-z\s]+)/gi,
    
    // Pattern 3: Bullet points with numbers
    /[•\-\*]\s*([A-Za-z\s]+?)[:|-]?\s*([0-9,]+(?:\.[0-9]+)?)\s*(%|percent|million|billion|thousand|k|m|b)?/gi,
    
    // Pattern 4: Table-like data
    /\|?\s*([A-Za-z\s]+?)\s*\|?\s*([0-9,]+(?:\.[0-9]+)?)\s*(%|percent|million|billion|thousand|k|m|b)?\s*\|?/gi
  ];

  const dataPoints: DataPoint[] = [];
  const seenNames = new Set<string>();

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(cleanText)) !== null) {
      let name: string;
      let valueStr: string;
      let unit: string | undefined;

      // Handle different capture group arrangements
      if (match[1] && match[2]) {
        // Pattern 1 & 3: Name first, then number
        name = match[1].trim();
        valueStr = match[2];
        unit = match[3];
      } else if (match[3]) {
        // Pattern 2: Number first, then name
        name = match[3].trim();
        valueStr = match[1];
        unit = match[2];
      } else {
        continue;
      }

      // Clean and validate the name
      name = name.replace(/[:|•\-\*\|]/g, '').trim();
      if (name.length < 2 || name.length > 50) continue;
      if (seenNames.has(name.toLowerCase())) continue;

      // Parse the number
      const numericValue = parseFloat(valueStr.replace(/,/g, ''));
      if (isNaN(numericValue) || numericValue <= 0) continue;

      // Apply unit multipliers
      let finalValue = numericValue;
      if (unit) {
        const unitLower = unit.toLowerCase();
        if (unitLower.includes('k') || unitLower.includes('thousand')) {
          finalValue *= 1000;
        } else if (unitLower.includes('m') || unitLower.includes('million')) {
          finalValue *= 1000000;
        } else if (unitLower.includes('b') || unitLower.includes('billion')) {
          finalValue *= 1000000000;
        }
      }

      // Determine if it's a percentage
      const isPercentage = unit && (unit.includes('%') || unit.toLowerCase().includes('percent'));
      
      dataPoints.push({
        name: name,
        value: finalValue,
        percentage: isPercentage ? numericValue : undefined
      });

      seenNames.add(name.toLowerCase());
    }
  }

  // Filter out invalid data points and ensure we have meaningful data
  const validDataPoints = dataPoints.filter(point => 
    point.name.length >= 2 && 
    point.value > 0 &&
    !point.name.match(/^(the|and|or|but|in|on|at|to|for|of|with|by)$/i)
  );

  // Need at least 2 data points to create a meaningful chart
  if (validDataPoints.length < 2) return null;

  // Limit to top 10 items for readability
  const sortedData = validDataPoints
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Determine chart type and title
  const hasPercentages = sortedData.some(point => point.percentage !== undefined);
  const totalValue = sortedData.reduce((sum, point) => sum + point.value, 0);
  
  // If all values are percentages and sum to ~100, it's likely distribution data
  const isDistribution = hasPercentages && totalValue >= 90 && totalValue <= 110;
  
  let title = 'Data Overview';
  let chartType: 'pie' | 'bar' = 'bar';

  // Determine appropriate chart type and title
  if (isDistribution || hasPercentages) {
    chartType = 'pie';
    title = 'Distribution';
  } else if (sortedData.length <= 6) {
    chartType = 'pie';
    title = 'Breakdown';
  } else {
    chartType = 'bar';
    title = 'Comparison';
  }

  // Try to infer a better title from context
  const contextKeywords = {
    population: ['population', 'people', 'residents', 'inhabitants'],
    economy: ['gdp', 'revenue', 'income', 'profit', 'sales', 'economic'],
    market: ['market', 'share', 'segment', 'industry'],
    demographics: ['age', 'gender', 'education', 'demographic'],
    geographic: ['country', 'state', 'city', 'region', 'area']
  };

  const textLower = cleanText.toLowerCase();
  for (const [category, keywords] of Object.entries(contextKeywords)) {
    if (keywords.some(keyword => textLower.includes(keyword))) {
      title = `${category.charAt(0).toUpperCase() + category.slice(1)} ${chartType === 'pie' ? 'Distribution' : 'Comparison'}`;
      break;
    }
  }

  return {
    data: sortedData,
    title,
    type: chartType
  };
}

export function shouldGenerateChart(text: string, query?: string): boolean {
  // Don't generate charts for simple questions or non-numerical content
  const simpleQuestionPatterns = [
    /^(what|who|when|where|why|how)\s+is\s+/i,
    /^(define|explain|describe)\s+/i,
    /^(tell me about|what does)\s+/i
  ];

  if (query) {
    for (const pattern of simpleQuestionPatterns) {
      if (pattern.test(query.trim())) return false;
    }
  }

  // Check if text contains numerical data patterns
  const numericalPatterns = [
    /\d+\s*%/g, // percentages
    /\d+\s*(million|billion|thousand|k|m|b)\b/gi, // large numbers with units
    /\$\d+/g, // currency
    /\d+\s*(people|population|residents)/gi, // population data
    /\d+\.\d+/g, // decimal numbers
  ];

  let numericalMatches = 0;
  for (const pattern of numericalPatterns) {
    const matches = text.match(pattern);
    if (matches) numericalMatches += matches.length;
  }

  // Require at least 3 numerical data points to consider chart generation
  return numericalMatches >= 3;
}