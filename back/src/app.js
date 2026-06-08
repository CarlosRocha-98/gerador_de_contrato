require("dotenv").config();

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("./config/passport");
const authRoutes = require("./routes/auth");

const app = express();

// necessário no Render
app.set("trust proxy", 1); // necessário para cookies seguros atrás de um proxy (Render, Vercel)

//  CORS
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(session({ 
    secret: process.env.SESSION_SECRET, 
    resave: false, 
    saveUninitialized: false,
    cookie: { 
        secure: true, // obrigatório em produção (HTTPS)
        sameSite: "none" // necessário para Vercel + Render
    }
}));
    
app.use(passport.initialize());
app.use(passport.session());

app.use(authRoutes);

// Isso funciona localmente, mas no Render NÃO funciona corretamente.
//app.listen(3000, () => console.log("Servidor rodando na porta 3000"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
