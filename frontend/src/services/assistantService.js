import { apiFetch, mockApiCall, getStoredItem, setStoredItem } from './api';
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
   * Connects to live database: POST /api/ai/assistant
   */
  async sendMessage(query) {
    if (!query || !query.trim()) {
      throw new Error('Query text is required.');
    }

    const trimmedQuery = query.trim();

    // 1. Try real database backend AI assistant
    try {
      const liveResponse = await apiFetch('/ai/assistant', {
        method: 'POST',
        body: JSON.stringify({ query: trimmedQuery })
      });

      if (liveResponse && (liveResponse.text || liveResponse.type)) {
        return {
          id: liveResponse.id || `ai-resp-${Date.now()}`,
          sender: 'ai',
          timestamp: liveResponse.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ...liveResponse
        };
      }
    } catch (err) {
      console.info('Live assistant query fallback to preset intent models:', err.message);
    }

    // 2. Fallback to predefined trigger intents
    const normalized = trimmedQuery.toLowerCase();
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
        400
      );
    }

    // 3. Dynamic SKU / Product Name match fallback
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
        300
      );
    }

    // 4. Fallback generic helpful response
    return mockApiCall(
      {
        id: `ai-resp-${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `I evaluated your query: "${query}". Here are live inventory insights from our active models:`,
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
      300
    );
  }
};
