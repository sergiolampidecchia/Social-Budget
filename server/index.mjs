import express from 'express';
import passport from 'passport';
import cors from 'cors';
import session from 'express-session';
import morgan from 'morgan';
import LocalStrategy from "passport-local";
import UserDao from './dao/dao-users.mjs';
import ProposalDAO from './dao/dao-proposals.mjs';
import PreferencesDAO from './dao/dao-preferences.mjs';
import ConfigDAO from './dao/dao-config.mjs';
import User from './models/model-user.mjs';

const userDao = new UserDao();
const proposalDao = new ProposalDAO();
const preferenceDao = new PreferencesDAO();
const configDao = new ConfigDAO();

const app = new express();
const port = 3001;

app.use(express.json());
app.use(passport.initialize());
app.use(morgan('dev'));

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));

passport.use(new LocalStrategy(function (username, password, callback){
  userDao.getUserByCredentials(username, password)
      .then(user => {
        if (user.error === 'Wrong username') {
          return callback(null, false, 'Wrong username');
        }
        if (user.error === 'Wrong password') {
          return callback(null, false, 'Wrong password');
        }
          return callback(null, user);
      })
      .catch(err => callback(err));
  }
));

passport.serializeUser((user,callback) => {
  callback(null, user.id);
})

passport.deserializeUser((id,callback) => {
  userDao.getUserById(id)
      .then(user => {
          callback(null, user);
      })
      .catch(err => callback(err));
});

app.use(session({
  secret: "This is a secrete information used to initialize the session!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate("session"));

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()){
    return next();
  }
  return res.status(401).json({error: "Not authorized"});
}

//Users API
app.post('/api/sessions', function(req, res, next){
  passport.authenticate('local', (err, user, info) => {
    if(err)
      return next(err);
      if(!user){
        return res.status(401).json({error: info});
      }
      req.login(user, (err) => {
        if(err)
          return res.status(500).json({error: err})
        else{
          return res.json(user);
        }
      });
  })(req, res, next);
});

app.get('/api/sessions/current', (req,res) => {
  if(req.isAuthenticated()){
    res.status(200).json(req.user);
  }else{
    res.status(401).json({error: "Not authenticated"});
  }
});

app.delete('/api/sessions/current', (req,res) => {
  req.logout(() => {
    res.end();
  });
});

//Proposals API
app.post('/api/proposals', isLoggedIn,
  async(req, res) => {
    const {description, budget} = req.body;
    try{
      const proposal = await proposalDao.createProposal(req.user.username, description, budget);
      res.status(200).json(proposal);
    }catch(error){
      if(error.message === "Proposals can only be created in phase 1" || error.message === "You cannot create more than 3 proposals"){
        res.status(403).json({error: error.message})
      }else if(error.message === "Budget must be greater than 0" || error.message === "Budget exceed the allowed limit" ){
        res.status(422).json({error: error.message})
      }else{
        res.status(503).json({error: "Database error"});
      }
    }
  }
)

app.get('/api/proposals/id', isLoggedIn,
  async(req, res) => {
    try{
      const proposals = await proposalDao.getProposalsByUserId(req.user)
      res.status(200).json(proposals);
    }catch(error){
        res.status(503).json({error: "Database error"})
    }
  }
)

app.get('/api/proposals', isLoggedIn,
  async(req, res) => {
    try{
      const proposals = await proposalDao.getAllProposals();
      res.status(200).json(proposals);
    }catch(error){
      if(error.message === "You are not authorized to see proposals during phase 1"){
        res.status(403).json({error: error.message})
      }else{
        res.status(503).json({error: "Database error"});
      }
    }
  }
);

app.put('/api/proposals/:id', isLoggedIn, 
  async (req,res) => {
    const id = req.params.id;
    const {description, budget} = req.body;
    try{
      const proposal = await proposalDao.updateProposal(req.user, id, description, budget)
      res.status(200).json(proposal);
    }catch(error){
      if(error.message === "You are not authorized to update this proposal" || error.message === "Proposals can only be updated in phase 1"){
        res.status(403).json({error: error.message});
      }else if(error.message === "Budget exceed the allowed limit" || error.message === "Budget must be greater than 0"){
        res.status(422).json({error: error.message});
      }else{
        res.status(503).json({error: "Database error"});
      }
    }
});

app.delete('/api/proposals/:id', isLoggedIn, 
  async (req,res) => {
    const id = req.params.id;
    try{
      const success = await proposalDao.deleteProposal(req.user, id)
      res.status(200).json({ success: success});
    }catch(error){
      if(error.message === "You are not authorized to delete this proposal" || error.message === "Proposals can only be deleted in phase 1"){
        res.status(403).json({error: error.message});
      }else{
        res.status(503).json({error: "Database error"});
      }
    }
  }
);

//Preferences API
app.post('/api/preferences', isLoggedIn, 
  async (req,res) => {
    const {proposalId, score} = req.body;
    try{
      const preference = await preferenceDao.addPreference(req.user, proposalId, score)
      res.status(200).json(preference)
    }catch(error){
      if(error.message === "Preferences can only be added in phase 2" || error.message === "You have already added a preference for this proposal" || error.message === "You cannot add a preference for your own proposal"){
        res.status(403).json({error: error.message});
      }else{
        res.status(503).json({error: error.message});
      }
    }
  }
);

app.get("/api/preferences", 
  async(req,res) => {
    try{
      const preferences = await preferenceDao.getAllPreferences();
      res.status(200).json(preferences);
    }catch(error){
      if(error.message === "You are not authorized to see preferences during this phase"){
        res.status(403).json({error: error.message})
      }else{
        res.status(503).json({error: "Database error"});
      }
    }
  }
);

app.get('/api/preferences/:id', isLoggedIn,
  async(req, res) => {
    const id = req.params.id;
    try{
      const preferences = await preferenceDao.getPreferencesByUserId(id)
      res.status(200).json(preferences);
    }catch(error){
        res.status(503).json({error: "Database error"})
    }
  }
);

app.delete('/api/preferences/:proposalId', isLoggedIn, 
  async (req,res) => {
    const proposalId = req.params.proposalId;
    try{
      const success = await preferenceDao.deletePreference(req.user, proposalId);
      res.status(200).json({success: success});
    }catch(error){
      if(error.message === "Preferences can be deleted only in phase 2"){
        res.status(403).json({error: error.message});
      }else{
        res.status(503).json({error: "Database error"});
      }
    }
  }
);

//Config API
app.post('/api/phase', isLoggedIn,
  async(req,res) => {
    try{
      const result = await configDao.changePhase(req.user);
      res.status(200).json(result);
    }catch(error){
      if(error.message === "Only Admin can change the phase" || error.message === "You have to insert the budget!"){
        res.status(403).json({error: error.message});
      }else{
        res.status(503).json({error: "Database error"});
      }
    }
  }
);

app.post('/api/budget', isLoggedIn,
  async(req,res) => {
    try{
      const { newBudget } = req.body;
      const result = await configDao.setBudget(req.user, newBudget);
      res.status(200).json(result);
    }catch(error){
      if(error.message === "Only Admin can set the budget" || error.message === "Budget can only bet set in phase 0"){
        res.status(403).json({error: error.message});
      }else if(error.message === "Budget must be greater than 0"){
        res.status(422).json({error: error.message});
      }else{
        res.status(503).json({error: "Database error"});
      }
    }
  }
);

app.get('/api/currentphase', 
  async(req,res) => {
    try{
      const result = await configDao.getCurrentPhase();
      res.status(200).json(result);
    }catch(error){
      res.status(503).json({error: "Database error"});
    }
  }
);

app.get('/api/getbudget', 
  async(req,res) => {
    try{
      const result = await configDao.getBudget();
      res.status(200).json(result);
    }catch(error){
      res.status(503).json({error: "Database error"})
    }
  }
)

app.put('/api/reset', isLoggedIn,
  async(req, res) => {
    try{
      const result = await configDao.reset(req.user);
      res.status(200).json(result);
    }catch(error){
      if(error.message === "You are not authorized to reset the database" || error.message === "You are not authorized to reset preferences if you are not in phase 3"){
        res.status(403).json({error: error.message});
      }else{
        res.status(503).json({error: "Database error"});
      }
    }
  }
);

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});