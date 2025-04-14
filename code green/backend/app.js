const express = require('express');
const mongoose = require('mongoose');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const { execFile } = require("child_process");
const app = express();
const { getSuggestions } = require("./suggestions");
const { spawn } = require("child_process");



mongoose.connect('mongodb://localhost:27017/eco_auth', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    credits: { type: Number, default: 100 }, 
    rewardsRedeemed: [{ type: String }]   ,
    tasks: [{
        title: String,
        done: Boolean,
        createdAt: { type: Date, default: Date.now }
      }]
        
  }));


app.use(express.static(path.join(__dirname, "../public")));
app.set("views", path.join(__dirname, "../views"));

app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'eco_secret_key',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.flash = req.flash();
  res.locals.user = req.session.user;
  next();
});

const greenTips = [
  "💡 Reduce your energy consumption by switching to energy-efficient appliances and turning off lights when not in use.",
  "🌍 To reduce your carbon footprint, consider using public transport or switching to electric vehicles.",
  "🚰 Save water by fixing leaks and using water-efficient appliances like low-flow showers.",
  "♻️ Recycle paper, plastic, and metal waste to reduce landfill use and promote sustainability.",
  "🛍️ Reduce single-use plastic by using reusable bags, bottles, and containers.",
  "🌳 Plant trees or support reforestation efforts to help improve air quality and provide habitats for wildlife.",
  "🌱 Embrace a sustainable lifestyle by making eco-friendly choices in your daily life, such as buying local and reducing waste.",
  "🍽️ Reduce food waste by planning meals and using leftovers creatively.",
  "🚶‍♂️ Walk or cycle instead of using your car for short trips to save energy and reduce emissions.",
  "🌾 Grow your own vegetables and herbs to reduce the carbon footprint associated with food production and transportation.",
  "🌞 Install solar panels to power your home and reduce reliance on non-renewable energy sources.",
  "🌿 Choose organic products to support eco-friendly farming practices and reduce chemical pesticide use.",
  "💧 Install rainwater harvesting systems to collect water for irrigation and reduce water consumption.",
  "🍃 Support eco-friendly businesses and products that promote sustainability and environmental stewardship.",
  "🌎 Educate yourself and others about environmental issues to create a more informed and proactive community.",
  "📚 Read books or watch documentaries about sustainability to stay inspired and learn new eco-friendly practices.",
  "🐦 Create a bird-friendly garden to support local wildlife and enhance biodiversity.",
  "🌍 Choose eco-friendly packaging when shopping to reduce waste and environmental impact.",
  "🏡 Consider building an energy-efficient home or retrofitting your current home to improve energy conservation.",
  "🎋 Use bamboo products, which are fast-growing and sustainable alternatives to traditional materials.",
  "📦 Opt for second-hand or upcycled furniture to reduce waste and promote the circular economy.",
  "🌸 Support local farmers' markets and businesses to reduce the carbon footprint of food transportation.",
  "🚶‍♀️ Reduce your reliance on plastic bags by switching to reusable cloth bags when shopping.",
  "🌼 Grow wildflowers or install a pollinator-friendly garden to support bees and other important pollinators.",
  "🖨️ Go paperless or use recycled paper to reduce deforestation and waste.",
  "⚡ Use energy-efficient lighting such as LED bulbs to reduce electricity consumption.",
  "📱 Reduce your e-waste by recycling old electronics or donating them to a responsible organization.",
  "🧴 Choose natural and non-toxic cleaning products to minimize pollution and improve indoor air quality.",
  "🏞️ Spend time in nature to reconnect with the environment and gain perspective on sustainability.",
  "🎒 Use a backpack made from recycled or sustainable materials to reduce your environmental footprint.",
  "👕 Choose clothing made from organic cotton, hemp, or other sustainable fabrics.",
  "🌅 Unplug devices when not in use to save electricity and reduce your carbon footprint.",
  "🍃 Install energy-efficient windows to help regulate indoor temperatures and reduce energy consumption.",
  "🛏️ Use eco-friendly bedding and linens made from organic or sustainably sourced materials.",
  "🖥️ Avoid printing documents unless absolutely necessary to reduce paper waste.",
  "🏕️ Choose eco-friendly camping gear and leave no trace when enjoying the outdoors.",
  "🌪️ Prepare for climate change by supporting policies that promote renewable energy and environmental conservation.",
  "🧃 Opt for reusable water bottles and containers instead of single-use plastic bottles.",
  "🚉 Travel by train or bus instead of flying to reduce carbon emissions.",
  "🌍 Donate to environmental organizations that support wildlife conservation and climate action.",
  "🦠 Support wildlife protection efforts to help preserve biodiversity and protect endangered species.",
  "🍂 Plant a garden with native plants to support local ecosystems and reduce the need for chemical fertilizers.",
  "🏙️ Advocate for more green spaces in urban areas to improve air quality and community well-being.",
  "🌽 Choose plant-based meals to reduce the environmental impact of animal farming.",
  "🧑‍🤝‍🧑 Collaborate with others in your community to organize sustainability initiatives like clean-up events or tree planting.",
  "📍 Use a map or GPS app to plan the most fuel-efficient route before traveling by car.",
  "🧑‍🏫 Teach others about the importance of sustainability in their daily lives.",
  "🎁 Choose sustainable gift-wrapping options like reusable fabric wraps or recycled paper.",
  "🏡 Consider using a smart thermostat to optimize heating and cooling in your home.",
  "🚯 Pick up litter when you see it in public spaces to help keep the environment clean.",
  "🌷 Support eco-friendly gardening by choosing native plants and avoiding harmful pesticides.",
  "🐝 Avoid using harmful chemicals in your garden that can harm pollinators like bees and butterflies."
]

app.post('/chat', (req, res) => {
  const tip = greenTips[Math.floor(Math.random() * greenTips.length)];
  res.json({ reply: `🌱 Here's a green tip: ${tip}` });
});

app.get("/get-news", (req, res) => {
  const query = req.query.q || "environment";

  execFile("python", ["newsFetcher.py", query], { cwd: __dirname },(error, stdout) => {
    if (error) {
      console.error("Python script error:", error.message);
      return res.status(500).json({ error: "Python script execution failed." });
    }

    try {
      const data = JSON.parse(stdout);
      res.json(data);
    } catch (e) {
      console.error("JSON parsing error:", e.message);
      res.status(500).json({ error: "Invalid JSON from Python script." });
    }
  });
});
  // Show To-Do Page
app.get('/tasks', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const user = await User.findById(req.session.user._id);
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
  
    const weeklyDone = user.tasks.filter(task =>
      task.done && task.createdAt > weekAgo
    );
  
    res.render('tasks', {
      tasks: user.tasks.sort((a, b) => b.createdAt - a.createdAt),
      weeklyDone,
      user
    });
  });
  
  // Add New Task
  app.post('/tasks', async (req, res) => {
    const user = await User.findById(req.session.user._id);
    user.tasks.push({ title: req.body.title, done: false });
    await user.save();
    res.redirect('/tasks');
  });
  
  // Mark Task as Done
  app.post('/tasks/done', async (req, res) => {
    const user = await User.findById(req.session.user._id);
    const task = user.tasks.id(req.body.taskId);
    if (task) task.done = true;
    await user.save();
    res.redirect('/tasks');
  });

app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = user;
    req.flash('success', 'Login successful');
    res.redirect('/dashboard');
  } else {
    req.flash('error', 'Invalid email or password');
    res.redirect('/login');
  }
});

app.get('/signup', (req, res) => res.render('signup'));
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    await User.create({ name, email, password: hash });
    req.flash('success', 'Signup successful. Please log in.');
    res.redirect('/login');
  } catch (err) {
    req.flash('error', 'Email already registered');
    res.redirect('/signup');
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('home', { name: req.session.user.name });
});
app.get("/profile", (req, res) => {
  const emission = req.query.emission || 0; // For now, use query or pass from session/db
  const totalCredits = 70; // Optional: Pass real credits if tracked
  res.render("profile", { emission, totalCredits });
});
app.get('/calculate', (req, res) => {
  res.render('calculate');
});
app.post("/calculate", (req, res) => {
  const { electricity, car, meat } = req.body;
  console.log(`Calculate request: electricity=${electricity}, car=${car}, meat=${meat}`);
  
  const py = spawn("python", [
    path.join(__dirname, "predictor.py"),
    electricity,
    car,
    meat,
  ]);
  
  let result = "";
  let error = "";

  py.stdout.on("data", (data) => {
    const output = data.toString();
    console.log(`Python stdout: "${output}"`);
    result += output;
  });

  py.stderr.on("data", (data) => {
    const output = data.toString();
    console.log(`Python stderr: "${output}"`);
    error += output;
  });

  py.on("close", (code) => {
    console.log(`Python process exited with code ${code}`);
    console.log(`Raw result: "${result}"`);
    
    if (code !== 0) {
      return res.json({ error: "Python script error: " + error });
    }

    try {
      // Clean the result string before parsing
      const cleanResult = result.trim().replace(/[^0-9.]/g, '');
      console.log(`Cleaned result: "${cleanResult}"`);
      
      const emission = parseFloat(cleanResult);
      console.log(`Parsed emission value: ${emission}`);
      
      if (isNaN(emission)) {
        // If still NaN, use a fallback calculation
        const fallbackEmission = 0.5 * electricity + 0.3 * car + 5 * meat;
        console.log(`Using fallback emission value: ${fallbackEmission}`);
        
        const suggestions = getSuggestions(electricity, car, meat);
        return res.json({ 
          emission: parseFloat(fallbackEmission.toFixed(2)), 
          suggestions,
          warning: "Used fallback calculation due to model issue"
        });
      }
      
      const suggestions = getSuggestions(electricity, car, meat);
      res.json({ emission, suggestions });
    } catch (e) {
      console.error("Error processing prediction result:", e);
      
      // Fallback calculation if parsing fails
      const fallbackEmission = 0.5 * electricity + 0.3 * car + 5 * meat;
      const suggestions = getSuggestions(electricity, car, meat);
      
      res.json({ 
        emission: parseFloat(fallbackEmission.toFixed(2)), 
        suggestions,
        warning: "Used fallback calculation due to error: " + e.message
      });
    }
  });
});


app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});
app.get('/news', (req, res) => {
  res.render('news');
});


app.listen(3000, () => console.log('Server running at http://localhost:3000'));
