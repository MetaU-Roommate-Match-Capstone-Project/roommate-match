const express = require('express');
const PORT = process.env.PORT || 3000;
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

const userRoutes = require('./api/user.js');
app.use('/api/users', userRoutes)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
