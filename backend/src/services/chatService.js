const MonitoringRecord = require('../models/MonitoringRecord');
const MonitoringPoint = require('../models/MonitoringPoint');

/**
 * AI Chat Service
 * LLM-READY architecture for environmental monitoring chatbot
 * Currently uses intelligent mock responses based on real data
 * Can be easily extended to use OpenAI, Azure OpenAI, or Google Gemini
 */
class ChatService {
  /**
   * Generate AI response to user message
   * This is the main entry point that can be swapped with real LLM API calls
   */
  static async generateResponse(userMessage, conversationHistory = []) {
    // In production, this would call:
    // - OpenAI API: await this.callOpenAI(userMessage, conversationHistory)
    // - Azure OpenAI: await this.callAzureOpenAI(userMessage, conversationHistory)
    // - Google Gemini: await this.callGemini(userMessage, conversationHistory)
    
    return await this.generateMockResponse(userMessage, conversationHistory);
  }

  /**
   * Intelligent mock response generator
   * Analyzes user query and provides contextual responses based on real monitoring data
   */
  static async generateMockResponse(userMessage, conversationHistory) {
    const message = userMessage.toLowerCase();

    // Detect query intent
    if (this.isGreeting(message)) {
      return this.getGreetingResponse();
    }

    if (this.isAirQualityQuery(message)) {
      return await this.getAirQualityResponse(message);
    }

    if (this.isWaterQualityQuery(message)) {
      return await this.getWaterQualityResponse(message);
    }

    if (this.isLocationQuery(message)) {
      return await this.getLocationResponse(message);
    }

    if (this.isStatisticsQuery(message)) {
      return await this.getStatisticsResponse(message);
    }

    if (this.isRecommendationQuery(message)) {
      return this.getRecommendationResponse(message);
    }

    if (this.isTrendQuery(message)) {
      return await this.getTrendResponse(message);
    }

    // Default intelligent response
    return this.getDefaultResponse(message);
  }

  // ========== Intent Detection Helpers ==========

  static isGreeting(message) {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(greeting => message.includes(greeting));
  }

  static isAirQualityQuery(message) {
    const keywords = ['air quality', 'aqi', 'pm2.5', 'pm10', 'pollution', 'air pollution'];
    return keywords.some(keyword => message.includes(keyword));
  }

  static isWaterQualityQuery(message) {
    const keywords = ['water quality', 'river', 'marine', 'lake', 'ph', 'dissolved oxygen', 'turbidity'];
    return keywords.some(keyword => message.includes(keyword));
  }

  static isLocationQuery(message) {
    const keywords = ['where', 'location', 'station', 'monitoring point', 'nearest'];
    return keywords.some(keyword => message.includes(keyword));
  }

  static isStatisticsQuery(message) {
    const keywords = ['statistics', 'stats', 'average', 'mean', 'total', 'count', 'how many'];
    return keywords.some(keyword => message.includes(keyword));
  }

  static isRecommendationQuery(message) {
    const keywords = ['recommend', 'suggest', 'should i', 'safe', 'advice', 'what can i do'];
    return keywords.some(keyword => message.includes(keyword));
  }

  static isTrendQuery(message) {
    const keywords = ['trend', 'improving', 'getting worse', 'change', 'over time', 'history'];
    return keywords.some(keyword => message.includes(keyword));
  }

  // ========== Response Generators ==========

  static getGreetingResponse() {
    const responses = [
      "Hello! I'm your EnviroWatch AI assistant for Malaysia. I can help you understand environmental monitoring data, air quality, water quality across Malaysia, and provide recommendations. What would you like to know?",
      "Hi there! I'm here to help you with environmental data insights from monitoring stations across Malaysia. You can ask me about air quality in Kuala Lumpur, water quality in our rivers, or trends. How can I assist you today?",
      "Welcome to EnviroWatch Malaysia! I can provide information about environmental conditions across Malaysian cities including Kuala Lumpur, Petaling Jaya, and Shah Alam. Ask me anything about air quality, water quality, or our monitoring stations.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  static async getAirQualityResponse(message) {
    try {
      // Get latest air quality data
      const airPoints = await MonitoringPoint.findAll({ type: 'air', status: 'active' });
      
      if (airPoints.length === 0) {
        return "I don't have any active air quality monitoring stations at the moment.";
      }

      // Get latest records for air stations
      const latestRecords = await MonitoringRecord.getLatestForAllPoints();
      const airRecords = latestRecords.filter(r => r.point_type === 'air' && r.aqi);

      if (airRecords.length === 0) {
        return "Air quality monitoring data is currently unavailable. Please check back later.";
      }

      // Calculate averages
      const avgAQI = Math.round(airRecords.reduce((sum, r) => sum + (r.aqi || 0), 0) / airRecords.length);
      const avgPM25 = (airRecords.reduce((sum, r) => sum + (parseFloat(r.pm25) || 0), 0) / airRecords.length).toFixed(1);

      // Determine air quality level
      let qualityLevel = 'Good';
      let healthAdvice = 'Air quality is satisfactory, and air pollution poses little or no risk.';
      
      if (avgAQI > 150) {
        qualityLevel = 'Unhealthy';
        healthAdvice = 'Everyone may begin to experience health effects. Members of sensitive groups may experience more serious health effects. Consider limiting prolonged outdoor activities.';
      } else if (avgAQI > 100) {
        qualityLevel = 'Unhealthy for Sensitive Groups';
        healthAdvice = 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
      } else if (avgAQI > 50) {
        qualityLevel = 'Moderate';
        healthAdvice = 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.';
      }

      return `Based on current monitoring data from ${airRecords.length} active air quality stations across Malaysia:\n\n` +
             `**Current Air Quality: ${qualityLevel}**\n` +
             `• Average AQI: ${avgAQI}\n` +
             `• Average PM2.5: ${avgPM25} µg/m³\n` +
             `• Temperature: ${airRecords[0].temperature ? parseFloat(airRecords[0].temperature).toFixed(1) + '°C' : 'N/A'}\n\n` +
             `**Health Advice:** ${healthAdvice}\n\n` +
             `Our monitoring stations in Kuala Lumpur, Petaling Jaya, and Shah Alam are actively tracking air quality. Would you like detailed information about specific monitoring stations?`;
    } catch (error) {
      console.error('Error in getAirQualityResponse:', error);
      return "I encountered an error retrieving air quality data. Please try again.";
    }
  }

  static async getWaterQualityResponse(message) {
    try {
      // Determine if asking about river or marine
      const isRiver = message.includes('river');
      const isMarine = message.includes('marine') || message.includes('bay') || message.includes('lake');
      
      let type = 'river';
      if (isMarine) type = 'marine';
      
      const waterPoints = await MonitoringPoint.findAll({ type, status: 'active' });
      
      if (waterPoints.length === 0) {
        return `I don't have any active ${type} water quality monitoring stations at the moment.`;
      }

      const latestRecords = await MonitoringRecord.getLatestForAllPoints();
      const waterRecords = latestRecords.filter(r => r.point_type === type && r.ph);

      if (waterRecords.length === 0) {
        return `${type.charAt(0).toUpperCase() + type.slice(1)} water quality data is currently unavailable.`;
      }

      const avgPH = (waterRecords.reduce((sum, r) => sum + (parseFloat(r.ph) || 0), 0) / waterRecords.length).toFixed(2);
      const avgDO = (waterRecords.reduce((sum, r) => sum + (parseFloat(r.dissolved_oxygen) || 0), 0) / waterRecords.length).toFixed(2);
      const avgTurbidity = (waterRecords.reduce((sum, r) => sum + (parseFloat(r.turbidity) || 0), 0) / waterRecords.length).toFixed(1);

      let qualityAssessment = 'Good';
      if (parseFloat(avgPH) < 6.5 || parseFloat(avgPH) > 8.5) {
        qualityAssessment = 'Moderate - pH levels outside optimal range';
      }
      if (parseFloat(avgDO) < 5) {
        qualityAssessment = 'Poor - Low dissolved oxygen levels';
      }

      return `Based on current monitoring data from ${waterRecords.length} active ${type} monitoring stations:\n\n` +
             `**Water Quality: ${qualityAssessment}**\n` +
             `• Average pH: ${avgPH} (optimal: 6.5-8.5)\n` +
             `• Average Dissolved Oxygen: ${avgDO} mg/L (healthy: >5 mg/L)\n` +
             `• Average Turbidity: ${avgTurbidity} NTU\n` +
             `• Water Temperature: ${waterRecords[0].temperature ? parseFloat(waterRecords[0].temperature).toFixed(1) + '°C' : 'N/A'}\n\n` +
             `**Assessment:** ${this.getWaterQualityAdvice(parseFloat(avgPH), parseFloat(avgDO))}\n\n` +
             `Would you like to know about specific monitoring locations?`;
    } catch (error) {
      console.error('Error in getWaterQualityResponse:', error);
      return "I encountered an error retrieving water quality data. Please try again.";
    }
  }

  static getWaterQualityAdvice(ph, dissolvedOxygen) {
    if (ph >= 6.5 && ph <= 8.5 && dissolvedOxygen >= 6) {
      return "Water quality parameters are within healthy ranges, indicating good conditions for aquatic life.";
    } else if (dissolvedOxygen < 5) {
      return "Dissolved oxygen levels are low, which may stress aquatic life. This could indicate pollution or eutrophication.";
    } else if (ph < 6.5) {
      return "Water is slightly acidic. This may affect aquatic ecosystems and could indicate pollution sources.";
    } else if (ph > 8.5) {
      return "Water is slightly alkaline. Monitoring is recommended to ensure ecosystem balance.";
    }
    return "Water quality parameters are generally acceptable but continue monitoring is recommended.";
  }

  static async getLocationResponse(message) {
    try {
      const allPoints = await MonitoringPoint.findAll({ status: 'active' });
      
      const airCount = allPoints.filter(p => p.type === 'air').length;
      const riverCount = allPoints.filter(p => p.type === 'river').length;
      const marineCount = allPoints.filter(p => p.type === 'marine').length;

      return `We currently have ${allPoints.length} active monitoring stations:\n\n` +
             `• **Air Quality Stations:** ${airCount}\n` +
             `• **River Monitoring Stations:** ${riverCount}\n` +
             `• **Marine/Lake Monitoring Stations:** ${marineCount}\n\n` +
             `These stations are strategically located across the region to provide comprehensive environmental coverage. ` +
             `You can view their exact locations on our interactive map page.\n\n` +
             `Would you like to know more about a specific type of monitoring station?`;
    } catch (error) {
      return "I encountered an error retrieving station information. Please try again.";
    }
  }

  static async getStatisticsResponse(message) {
    try {
      const stats = await MonitoringRecord.getDashboardStats();
      
      return `Here are our current environmental monitoring statistics:\n\n` +
             `• **Active Monitoring Stations:** ${stats.active_stations || 0}\n` +
             `• **Records Collected (24h):** ${stats.total_records || 0}\n` +
             `• **Average AQI:** ${stats.avg_aqi ? Math.round(stats.avg_aqi) : 'N/A'}\n` +
             `• **Average PM2.5:** ${stats.avg_pm25 ? parseFloat(stats.avg_pm25).toFixed(1) + ' µg/m³' : 'N/A'}\n` +
             `• **Good Air Quality Readings:** ${stats.good_air_count || 0}\n` +
             `• **Unhealthy Air Quality Readings:** ${stats.unhealthy_air_count || 0}\n\n` +
             `These statistics are updated in real-time as new data comes in from our monitoring network.`;
    } catch (error) {
      return "I encountered an error retrieving statistics. Please try again.";
    }
  }

  static getRecommendationResponse(message) {
    return "Based on current environmental conditions, here are my recommendations:\n\n" +
           "**For Air Quality:**\n" +
           "• Check the AQI before planning outdoor activities\n" +
           "• If AQI is above 100, limit prolonged outdoor exertion\n" +
           "• Consider wearing a mask in areas with high PM2.5 levels\n\n" +
           "**For Water Safety:**\n" +
           "• Avoid swimming in areas with poor water quality ratings\n" +
           "• Check recent water quality reports before water activities\n" +
           "• Report any unusual odors or colors in water bodies\n\n" +
           "**General Tips:**\n" +
           "• Stay informed with our real-time monitoring dashboard\n" +
           "• Subscribe to alerts for your area\n" +
           "• Report environmental concerns to local authorities\n\n" +
           "Is there a specific recommendation you'd like more details about?";
  }

  static async getTrendResponse(message) {
    return "To analyze environmental trends, I can look at historical data over different time periods:\n\n" +
           "**Available Trend Analysis:**\n" +
           "• Daily trends (24-hour patterns)\n" +
           "• Weekly trends (7-day averages)\n" +
           "• Monthly trends (30-day comparisons)\n\n" +
           "**What we're monitoring:**\n" +
           "• Air quality is generally stable with seasonal variations\n" +
           "• Water quality shows gradual improvement due to rehabilitation efforts\n" +
           "• PM2.5 levels tend to increase during dry season\n\n" +
           "You can view detailed trend charts on our dashboard. " +
           "Which specific parameter would you like to see trends for?";
  }

  static getDefaultResponse(message) {
    return "I understand you're asking about environmental monitoring. I can help you with:\n\n" +
           "• **Air Quality** - Current AQI, PM2.5, PM10 levels and forecasts\n" +
           "• **Water Quality** - pH, dissolved oxygen, and turbidity in rivers and marine areas\n" +
           "• **Monitoring Stations** - Locations and status of our monitoring network\n" +
           "• **Statistics** - Historical data and trends\n" +
           "• **Recommendations** - Health advice based on current conditions\n\n" +
           "Please rephrase your question or ask about one of these topics, and I'll provide specific information!";
  }

  /**
   * PLACEHOLDER: OpenAI Integration
   * Uncomment and configure when ready to use real LLM
   */
  /*
  static async callOpenAI(userMessage, conversationHistory) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const messages = [
      {
        role: 'system',
        content: 'You are an AI assistant for EnviroWatch, an environmental monitoring platform. ' +
                 'Help users understand air quality, water quality, and environmental data. ' +
                 'Provide accurate, helpful, and science-based responses.'
      },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content;
  }
  */
}

module.exports = ChatService;
