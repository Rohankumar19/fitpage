
export function extractTags(reviews: Array<{ reviewText: string }>): string[] {
  if (!reviews || reviews.length === 0) return [];

  // Enhanced stop words list
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'my', 'your', 'his', 'her', 'its', 'our', 'their', 'very', 'so', 'too', 'just', 'now', 'then',
    'than', 'only', 'also', 'really', 'quite', 'all', 'some', 'any', 'no', 'not', 'yes', 'well',
    'get', 'got', 'getting', 'go', 'going', 'went', 'come', 'came', 'coming', 'make', 'made', 'making',
    'take', 'took', 'taking', 'see', 'saw', 'seen', 'look', 'looking', 'looked', 'use', 'used', 'using',
    'know', 'knew', 'known', 'think', 'thought', 'thinking', 'say', 'said', 'saying', 'tell', 'told',
    'work', 'worked', 'working', 'give', 'gave', 'given', 'put', 'putting', 'one', 'two', 'three'
  ]);

  // Product-related positive and negative keywords to prioritize
  const productKeywords = new Set([
    'quality', 'durable', 'comfortable', 'lightweight', 'heavy', 'soft', 'hard', 'smooth', 'rough',
    'fast', 'slow', 'easy', 'difficult', 'simple', 'complex', 'beautiful', 'ugly', 'stylish',
    'cheap', 'expensive', 'affordable', 'reliable', 'unreliable', 'sturdy', 'fragile', 'perfect',
    'excellent', 'amazing', 'terrible', 'awful', 'fantastic', 'wonderful', 'disappointing',
    'recommend', 'recommended', 'worth', 'value', 'money', 'price', 'delivery', 'shipping',
    'packaging', 'design', 'color', 'size', 'fit', 'comfortable', 'uncomfortable'
  ]);

  // Extract all words from reviews with enhanced processing
  const wordFrequency: { [key: string]: number } = {};
  const phrases: { [key: string]: number } = {};

  reviews.forEach(review => {
    if (review.reviewText) {
      const text = review.reviewText.toLowerCase();
      
      // Extract single words
      const words = text
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => 
          word.length > 2 && 
          !stopWords.has(word) && 
          !/^\d+$/.test(word) // Remove pure numbers
        );

      words.forEach(word => {
        // Give higher weight to product-related keywords
        const weight = productKeywords.has(word) ? 3 : 1;
        wordFrequency[word] = (wordFrequency[word] || 0) + weight;
      });

      // Extract two-word phrases for better context
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = `${words[i]} ${words[i + 1]}`;
        if (phrase.length > 5 && !stopWords.has(words[i]) && !stopWords.has(words[i + 1])) {
          phrases[phrase] = (phrases[phrase] || 0) + 1;
        }
      }
    }
  });

  // Combine single words and phrases, prioritizing high-frequency items
  const allItems = [
    ...Object.entries(wordFrequency).map(([word, freq]) => ({ text: word, frequency: freq, type: 'word' })),
    ...Object.entries(phrases).map(([phrase, freq]) => ({ text: phrase, frequency: freq * 1.5, type: 'phrase' })) // Give phrases slight boost
  ];

  // Sort by frequency and return top tags
  return allItems
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10)
    .filter(item => item.frequency >= 2) // Only show items mentioned at least twice
    .slice(0, 8)
    .map(item => item.text);
}
