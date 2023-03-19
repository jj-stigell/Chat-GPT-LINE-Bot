// Project imports
import { app } from './app';
import { PORT } from './configs/environment';
import { connectToDatabase } from './database/index';

app.listen(PORT, async () => {
  await connectToDatabase();
  console.log(`Application started on PORT: ${PORT} 🎉`);
});
