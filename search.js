import https from 'https';
import { promises as fs } from 'fs';
import openai from './openaiClient.js';
import { Document } from 'langchain/document'
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import jsonData from './moviesData.json' assert { type: 'json' };
import { openAIOptions } from './query.js';


 
const createStore = () => MemoryVectorStore.fromDocuments(
  jsonData.map(
    (movie) =>
      new Document({
        pageContent: `Title: ${movie.name || movie.title}\n ${movie.overview}`,
        metadata : {source:movie.id,title: movie.name || movie.title}
      })
  ),
  new OpenAIEmbeddings(openAIOptions)
)



const search = async (query, count = 2) => {
  const store = await createStore()
  return store.similaritySearch(query, count)
}


console.log( await search('a movie that has some comedy and horror'))




const fetchPage = (page) => {
  return new Promise((resolve, reject) => {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=d28a406f288d6fecaedd53acb77efe34&page=${page}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', (err) => reject(err));
  });
};

const fetchAllPagesAndWriteToFile = async (totalPages) => {
  let allResults = [];

  for (let page = 1; page <= totalPages; page++) {
    try {
      console.log(`Fetching page ${page}...`);
      const response = await fetchPage(page);
      allResults = allResults.concat(response.results);
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      break; // Stop fetching if an error occurs
    }
  }

  try {
    await fs.writeFile('moviesData.json', JSON.stringify(allResults, null, 2));
    console.log('All data successfully written to moviesData.json');
  } catch (error) {
    console.error('Error writing to file:', error);
  }
};

// fetchAllPagesAndWriteToFile(100);


