import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import dns from 'dns/promises';

dotenv.config();

async function testQdrant() {
    console.log('Testing Qdrant connection...');
    const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
    console.log(`Configured Qdrant URL: ${qdrantUrl}`);

    // Check DNS resolution for localhost
    try {
        const lookup = await dns.lookup('localhost');
        console.log(`'localhost' resolves to: ${lookup.address} (family: ${lookup.family})`);
    } catch (e) {
        console.log(`DNS lookup for 'localhost' failed: ${e}`);
    }

    // Test Configured URL
    try {
        console.log(`Attempting connection to ${qdrantUrl}...`);
        const response = await fetch(`${qdrantUrl}/collections`);
        if (!response.ok) throw new Error(response.statusText);
        console.log(`Success connecting to ${qdrantUrl}`);
    } catch (error) {
        console.error(`Failed connecting to ${qdrantUrl}:`, error);
    }

    // Test 127.0.0.1 explicitly if different
    if (!qdrantUrl.includes('127.0.0.1')) {
        const explicitUrl = qdrantUrl.replace('localhost', '127.0.0.1');
        try {
            console.log(`Attempting connection to ${explicitUrl}...`);
            const response = await fetch(`${explicitUrl}/collections`);
            if (!response.ok) throw new Error(response.statusText);
            console.log(`Success connecting to ${explicitUrl}`);
        } catch (error) {
            console.error(`Failed connecting to ${explicitUrl}:`, error);
        }
    }
}

async function testOpenAI() {
    console.log('\nTesting OpenAI connection...');
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error('OPENAI_API_KEY is not set in environment variables.');
        return;
    }
    console.log(`OpenAI API Key present: ${apiKey.substring(0, 5)}...`);

    const client = new OpenAI();

    try {
        const completion = await client.chat.completions.create({
            messages: [{ role: 'user', content: 'Hello' }],
            model: 'gpt-4o-mini',
        });
        console.log('OpenAI connection successful.');
    } catch (error) {
        console.error('OpenAI connection failed:', error);
    }
}

async function main() {
    await testQdrant();
    await testOpenAI();
}

main();
