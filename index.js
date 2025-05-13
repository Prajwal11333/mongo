// import express from "express";
// import axios from "axios";
// import bodyParser from "body-parser";

// const app = express();
// const port = 3000;
// const API_URL = "http://localhost:4000";
// const PYTHON_API_URL = "http://localhost:8000"; // FastAPI backend for sign language recognition
// const TRANSLATE_API_URL = "http://localhost:8001"; // FastAPI backend for sign language translation
// const NUMBERS_LETTERS_API_URL = "http://localhost:8002"; // FastAPI backend for numbers and letters recognition

// app.use(express.static('public'));

// // Increase the body size limit for JSON and URL-encoded data
// app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// app.get("/", (req, res) => {
//     res.render('home.ejs');
// });

// app.get("/tutorials", (req, res) => {
//     res.render("tutorials.ejs");
// });

// app.get("/translate", (req, res) => {
//     res.render("translate.ejs");
// });

// app.get("/login", (req, res) => {
//     res.render("login.ejs");
// });

// // Quiz routes
// app.get("/quiz", (req, res) => {
//     res.render("quiz.ejs");
// });

// app.get("/about",(req,res)=>{
//     res.render("about.ejs");
// });

// app.get("/community",(req,res)=>{
//     res.render("community.ejs");
// });

// // Translation routes
// app.get("/translate", (req, res) => {
//     res.render("translate.ejs");
// });

// // New route for numbers and letters recognition
// app.get("/numbers-letters", (req, res) => {
//     res.render("numbers-letters.ejs");
// });

// // API endpoint to proxy requests to the Python backend for quiz
// app.post("/api/quiz", async (req, res) => {
//     try {
//         // Forward the request to the Python backend
//         const response = await axios.post(`${PYTHON_API_URL}/api/quiz`, req.body, {
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             maxContentLength: Infinity,
//             maxBodyLength: Infinity
//         });
        
//         // Return the Python backend's response
//         res.json(response.data);
//     } catch (error) {
//         console.error("Error forwarding to Python backend:", error.message);
//         res.status(500).json({
//             error: "Failed to process sign language recognition",
//             details: error.message
//         });
//     }
// });

// // API endpoint to proxy requests to the Python backend for translation
// app.post("/api/translate", async (req, res) => {
//     try {
//         // Forward the request to the Translation API backend
//         const response = await axios.post(`${TRANSLATE_API_URL}/api/translate`, req.body, {
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             maxContentLength: Infinity,
//             maxBodyLength: Infinity
//         });
        
//         // Return the Translation API's response
//         res.json(response.data);
//     } catch (error) {
//         console.error("Error forwarding to Translation API:", error.message);
//         res.status(500).json({
//             error: "Failed to process sign language translation",
//             details: error.message
//         });
//     }
// });

// // API endpoint to proxy requests to the Python backend for numbers and letters recognition
// app.post("/api/recognize", async (req, res) => {
//     try {
//         // Forward the request to the Numbers & Letters Recognition API
//         const response = await axios.post(`${NUMBERS_LETTERS_API_URL}/api/recognize`, req.body, {
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             maxContentLength: Infinity,
//             maxBodyLength: Infinity
//         });
        
//         // Return the Recognition API's response
//         res.json(response.data);
//     } catch (error) {
//         console.error("Error forwarding to Recognition API:", error.message);
//         res.status(500).json({
//             error: "Failed to process numbers and letters recognition",
//             details: error.message
//         });
//     }
// });

// // Existing routes for tutorials
// app.get("/tutorials/basics", async (req, res) => {
//     try {
//         // By default, load the Introduction video (001)
//         const response = await axios.get(`${API_URL}/videolib/001`);
//         res.render("basics.ejs", {
//             videos: response.data
//         });
//     } catch (error) {
//         console.error("Error fetching default video:", error.message);
//         res.render("basics.ejs", {
//             videos: null
//         });
//     }
// });

// app.get("/tutorials/basics/:id", async (req,res) => {
//     const videoId = req.params.id;
//     try {
//         const response = await axios.get(`${API_URL}/videolib/${videoId}`);
        
//         // Check if this is an AJAX request (looks for XHR header or accepts JSON)
//         const isAjaxRequest = req.xhr || req.headers.accept.indexOf('json') > -1;
        
//         if (isAjaxRequest) {
//             // Return JSON for AJAX requests
//             res.json({
//                 videos: response.data
//             });
//         } else {
//             // Return full page for direct access
//             res.render("basics.ejs", {
//                 videos: response.data
//             });
//         }
//     } catch(error) {
//         console.error("Error fetching video:", error.message);
//         if (req.xhr || req.headers.accept.indexOf('json') > -1) {
//             res.status(500).json({message: "Error fetching the video"});
//         } else {
//             res.status(500).render("error.ejs", {message: "Error fetching the video"});
//         }
//     }
// });

// app.get("/tutorials/family-signs", async (req, res) => {
//     try {
//         // By default, load the Family Signs video (004)
//         const response = await axios.get(`${API_URL}/videolib/004`);
//         res.render("family-signs.ejs", {
//             videos: response.data
//         });
//     } catch (error) {
//         console.error("Error fetching default video:", error.message);
//         res.render("family-signs.ejs", {
//             videos: null
//         });
//     }
// });

// app.get("/tutorials/family-signs/:id", async (req, res) => {
//     const videoId = req.params.id;
//     try {
//         const response = await axios.get(`${API_URL}/videolib/${videoId}`);
        
//         // Check if this is an AJAX request
//         const isAjaxRequest = req.xhr || req.headers.accept.indexOf('json') > -1;
        
//         if (isAjaxRequest) {
//             // Return JSON for AJAX requests
//             res.json({
//                 videos: response.data
//             });
//         } else {
//             // Return full page for direct access
//             res.render("family-signs.ejs", {
//                 videos: response.data
//             });
//         }
//     } catch(error) {
//         console.error("Error fetching video:", error.message);
//         if (req.xhr || req.headers.accept.indexOf('json') > -1) {
//             res.status(500).json({message: "Error fetching the video"});
//         } else {
//             res.status(500).render("error.ejs", {message: "Error fetching the video"});
//         }
//     }
// });

// app.get("/tutorials/emotions-expressions", async (req, res) => {
//     try {
//         // By default, load the Emotions Introduction video (007)
//         const response = await axios.get(`${API_URL}/videolib/005`);
//         res.render("emotions-expressions.ejs", {
//             videos: response.data
//         });
//     } catch (error) {
//         console.error("Error fetching default video:", error.message);
//         res.render("emotions-expressions.ejs", {
//             videos: null
//         });
//     }
// });

// app.get("/tutorials/emotions-expressions/:id", async (req, res) => {
//     const videoId = req.params.id;
//     try {
//         const response = await axios.get(`${API_URL}/videolib/${videoId}`);
        
//         // Check if this is an AJAX request
//         const isAjaxRequest = req.xhr || req.headers.accept.indexOf('json') > -1;
        
//         if (isAjaxRequest) {
//             // Return JSON for AJAX requests
//             res.json({
//                 videos: response.data
//             });
//         } else {
//             // Return full page for direct access
//             res.render("emotions-expressions.ejs", {
//                 videos: response.data
//             });
//         }
//     } catch(error) {
//         console.error("Error fetching video:", error.message);
//         if (req.xhr || req.headers.accept.indexOf('json') > -1) {
//             res.status(500).json({message: "Error fetching the video"});
//         } else {
//             res.status(500).render("error.ejs", {message: "Error fetching the video"});
//         }
//     }
// });

// // Add Quiz Endpoints
// app.get("/tutorials/quiz", (req, res) => {
//     res.render("quiz.ejs");
// });

// app.get("/tutorials/quiz/:category", (req, res) => {
//     const category = req.params.category;
//     res.render("quiz.ejs", { category: category });
// });

// app.listen(port, () => {
//     console.log("Server listening on port " + port);
// });



import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authroute.js";
import { isLoggedIn } from "./middleware/auth.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const API_URL = process.env.API_URL || "http://localhost:4000";

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Apply the isLoggedIn middleware to all routes
app.use(isLoggedIn);

// API Routes
app.use('/api/auth', authRoutes);

// View Routes
app.get("/", (req, res) => {
    res.render('home.ejs');
});

app.get("/tutorials", (req, res) => {
    res.render("tutorials.ejs");
});

app.get("/login", (req, res) => {
    // If already logged in, redirect to home
    if (res.locals.isAuthenticated) {
        return res.redirect('/');
    }
    res.render("login.ejs");
});

app.get("/translate", (req, res) => {
    res.render("translate.ejs");
});

app.get("/about", (req, res) => {
    res.render("about.ejs");
});
app.get("/community", (req, res) => {
    res.render("community.ejs");
});

// video data fetching from basic.ejs as try and catch method
app.get("/tutorials/basics", async (req, res) => {
    try {
        // By default, load the Introduction video (001)
        const response = await axios.get(`${API_URL}/videolib/001`);
        res.render("basics.ejs", {
            videos: response.data
        });
    } catch (error) {
        console.error("Error fetching default video:", error.message);
        res.render("basics.ejs", {
            videos: null
        });
    }
});

// Existing video routes
app.get("/tutorials/basics/:id", async (req, res) => {
    const videoId = req.params.id;
    try {
        const response = await axios.get(`${API_URL}/videolib/${videoId}`);
        
        // Check if this is an AJAX request
        const isAjaxRequest = req.xhr || req.headers.accept.indexOf('json') > -1;
        
        if (isAjaxRequest) {
            // Return JSON for AJAX requests
            res.json({
                videos: response.data
            });
        } else {
            // Return full page for direct access
            res.render("basics.ejs", {
                videos: response.data
            });
        }
    } catch(error) {
        console.error("Error fetching video:", error.message);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.status(500).json({message: "Error fetching the video"});
        } else {
            res.status(500).render("error.ejs", {message: "Error fetching the video"});
        }
    }
});

app.get("/tutorials/family-signs", async (req, res) => {
    try {
        // By default, load the Family Signs video (004)
        const response = await axios.get(`${API_URL}/videolib/004`);
        res.render("family-signs.ejs", {
            videos: response.data
        });
    } catch (error) {
        console.error("Error fetching default video:", error.message);
        res.render("family-signs.ejs", {
            videos: null
        });
    }
});

app.get("/tutorials/family-signs/:id", async (req, res) => {
    const videoId = req.params.id;
    try {
        const response = await axios.get(`${API_URL}/videolib/${videoId}`);
        
        // Check if this is an AJAX request
        const isAjaxRequest = req.xhr || req.headers.accept.indexOf('json') > -1;
        
        if (isAjaxRequest) {
            // Return JSON for AJAX requests
            res.json({
                videos: response.data
            });
        } else {
            // Return full page for direct access
            res.render("family-signs.ejs", {
                videos: response.data
            });
        }
    } catch(error) {
        console.error("Error fetching video:", error.message);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.status(500).json({message: "Error fetching the video"});
        } else {
            res.status(500).render("error.ejs", {message: "Error fetching the video"});
        }
    }
});

app.get("/tutorials/emotions-expressions", async (req, res) => {
    try {
        // By default, load the Emotions Introduction video (007)
        const response = await axios.get(`${API_URL}/videolib/005`);
        res.render("emotions-expressions.ejs", {
            videos: response.data
        });
    } catch (error) {
        console.error("Error fetching default video:", error.message);
        res.render("emotions-expressions.ejs", {
            videos: null
        });
    }
});

app.get("/tutorials/emotions-expressions/:id", async (req, res) => {
    const videoId = req.params.id;
    try {
        const response = await axios.get(`${API_URL}/videolib/${videoId}`);
        
        // Check if this is an AJAX request
        const isAjaxRequest = req.xhr || req.headers.accept.indexOf('json') > -1;
        
        if (isAjaxRequest) {
            // Return JSON for AJAX requests
            res.json({
                videos: response.data
            });
        } else {
            // Return full page for direct access
            res.render("emotions-expressions.ejs", {
                videos: response.data
            });
        }
    } catch(error) {
        console.error("Error fetching video:", error.message);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.status(500).json({message: "Error fetching the video"});
        } else {
            res.status(500).render("error.ejs", {message: "Error fetching the video"});
        }
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});