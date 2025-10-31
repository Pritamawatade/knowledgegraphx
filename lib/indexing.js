import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import 'dotenv/config'

const path = "../nodejs.pdf";
async function index(){

    const loader = new PDFLoader(path);

    const docs  = await loader.load();

    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
            url: "http://localhost:6333",
            collectionName: "langchainjs-demo",
        }
    )

    await vectorStore.addDocuments(docs)

    console.log("Indexed successfully");



}