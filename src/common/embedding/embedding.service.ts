import { Injectable, Logger } from '@nestjs/common';

const EMBEDDING_MODEL = 'nomic-embed-text';
const EMBEDDING_DIMENSIONS = 768;
const OLLAMA_EMBEDDINGS_URL = 'http://localhost:11434/api/embeddings';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  async generateEmbedding(input: string): Promise<number[]> {
    this.logger.debug(`Embedding input: ${input}`);

    const response = await fetch(OLLAMA_EMBEDDINGS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        prompt: input,
      }),
    });

    this.logger.debug(`Ollama response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Ollama embeddings request failed with status ${response.status}. ${errorText}`.trim(),
      );
    }

    const data = (await response.json()) as { embedding?: number[] };
    const embedding = data.embedding;
    if (!embedding) {
      throw new Error('Ollama response missing embedding data');
    }

    this.logger.debug(`Embedding length: ${embedding.length}`);

    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Embedding dimension mismatch. Expected ${EMBEDDING_DIMENSIONS}, got ${embedding.length}.`,
      );
    }

    return embedding;
  }
}
