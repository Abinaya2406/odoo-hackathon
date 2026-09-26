import { mockApiCall, getStoredItem, setStoredItem } from './api';
import { SUGGESTED_QUESTIONS, PRESET_INTENT_RESPONSES } from '../data/assistantData';
import { STOCKOUT_PREDICTIONS } from '../data/predictions';
import { ANOMALY_RECORDS } from '../data/anomalies';
import { SCANNABLE_PRODUCTS } from '../data/scannerData';

const CHAT_HISTORY_KEY = 'stocksense_assistant_history';

export const assistantService = {
  /**
   * Get list of initial suggested prompts
   */
  getSuggestedQuestions() {
    return SUGGESTED_QUESTIONS;
  },

  /**
   * Get persistent chat history
   */
  async getChatHistory() {
    const defaultHistory = [
      {
        id: 'msg-init-1',
        sender: 'ai',
        text: 'Hello! I am StockSense AI, your intelligent inventory copilot. You can ask me about stockout risks, demand forecasts, anomalous movements, or specific SKU availability across your warehouses.',
        type: 'text',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    const history = getStoredItem(CHAT_HISTORY_KEY, defaultHistory);
    return mockApiCall(history, 100);
  },

  /**
   * Save entire chat history
   */
  async saveChatHistory(history) {
    setStoredItem(CHAT_HISTORY_KEY, history);
    return true;
  },

  /**
   * Clear conversation history
   */
  async clearChatHistory() {
    setStoredItem(CHAT_HISTORY_KEY, []);
    return mockApiCall([], 100);
  },

  /**
   * Process natural-language query and return rich multi-format payload.
   * Prepared for future: POST /api/ai/assistant
   */
  async sendMessage(query) {
    if (!query || !query.trim()) {
      throw new Error('Query text is required.');
    }

    const normalized = query.toLowerCase().trim();

    // 1. Check predefined trigger intents
    const matchedIntent = PRESET_INTENT_RESPONSES.find((item) =>
      item.triggers.some((trig) => normalized.includes(trig))
    );

    if (matchedIntent) {
      return mockApiCall(
        {
          id: `ai-resp-${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ...matchedIntent.response
        },
        600 // simulate realistic AI inference time
      );
    }

    // 2. Dynamic SKU / Product Name match fallback
    const matchedProduct = SCANNABLE_PRODUCTS.find(
      (p) =>
        normalized.includes(p.sku.toLowerCase()) ||
        normalized.includes(p.name.toLowerCase()) ||
        normalized.includes(p.category.toLowerCase())
    );

    if (matchedProduct) {
      const pred = STOCKOUT_PREDICTIONS.find((pr) => pr.sku === matchedProduct.sku);
      return mockApiCall(
        {
          id: `ai-resp-${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Here is the current operational profile for **${matchedProduct.name}** (${matchedProduct.sku}):`,
          type: 'product_detail',
          product: {
            name: matchedProduct.name,
            sku: matchedProduct.sku,
            totalStock: `${matchedProduct.currentStock} ${matchedProduct.unit}`,
            warehouse: matchedProduct.warehouse,
            status: matchedProduct.status,
            burnRate: pred ? `${pred.avgDailyUsage} ${pred.unit}/day` : 'N/A',
            predictedStockout: pred ? `${pred.predictedStockoutDays} days remaining (${pred.predictedStockoutDate})` : 'Stable',
            lastMovement: matchedProduct.lastMovementDate,
            supplier: matchedProduct.supplier
          },
          actions: [
            { label: 'View Stockout Trajectory', url: `/ai/stockout-prediction?product=${matchedProduct.sku}` },
            { label: 'Scan Product', url: `/scanner?code=${matchedProduct.sku}` }
          ]
        },
        500
      );
    }

    // 3. Fallback generic helpful response
    return mockApiCall(
      {
        id: `ai-resp-${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `I evaluated your query: "${query}". While I didn't find an exact pre-computed rule, here are quick insights from our live inventory models:`,
        type: 'fallback_summary',
        summary: {
          activeAnomaliesCount: ANOMALY_RECORDS.filter((a) => a.status === 'Unreviewed').length,
          criticalProductsCount: STOCKOUT_PREDICTIONS.filter((p) => p.predictedStockoutDays <= 7).length,
          topSuggestion: 'You can query stock depletion, warehouse capacities, or scan codes directly.'
        },
        quickPrompts: [
          'Which products may run out this week?',
          'Show products with critical stock.',
          'Which products had unusual stock movements?'
        ]
      },
      500
    );
  }
};
