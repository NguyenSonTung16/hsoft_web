import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupApolloGraphQL } from './graphql';

dotenv.config();

const app = express();
// Chỉ cho phép frontend truy cập
app.use(cors({ origin: 'http://localhost:5173' }));
const PORT = process.env.PORT || 3000;

app.use(express.json());

(async () => {
  await setupApolloGraphQL(app);
})();

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
