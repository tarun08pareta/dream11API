const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

mongoose.connect('mongodb://localhost:27017/dream11', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});


const userSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  password: String,
  confirmPassword: String,
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// GET all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch users' });
  }
});

// POST create a user
app.post('/api/users', async (req, res) => {
  const { fullname, email, password, confirmPassword } = req.body;

  if (!fullname || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const newUser = await User.create({ fullname, email, password, confirmPassword });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Could not create user' });
  }
});

// PUT update a user by ID
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { fullname, email, password, confirmPassword } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields
    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.password = password || user.password;
    user.confirmPassword = confirmPassword || user.confirmPassword;

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Could not update user' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
