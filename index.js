import dns from 'node:dns/promises';
import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';


import { registerValidation, loginValidation, postCreateValidation } from './validations.js';

import { PostController, UserController } from './controllers/index.js';

import { checkAuth, handeValidationErrors } from './utils/index.js';


dns.setServers(["1.1.1.1"]);
// console.log(await dns.getServers());

dotenv.config();


mongoose
	.connect(process.env.MONGO_DB_URI)
	.then(() => console.log('DB OK'))
	.catch((err) => console.log('DB error', err))

const app = express();

const storage = multer.diskStorage({
	destination: (_, __, cb) => {
		cb(null, 'uploads');
	},
	filename: (_, file, cb) => {
		cb(null, file.originalname);
	}
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handeValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handeValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
	if (!req.file) {
		return res.status(400).json({ message: 'Пожалуйста, выберите файл для загрузки.' });
	}

	res.json({
		url: `/uploads/${req.file.originalname}`
	});
});

app.get('/tags', PostController.getLastTags);

app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handeValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts/:id', checkAuth, postCreateValidation, handeValidationErrors, PostController.update);


app.listen(process.env.PORT || 4444, (err) => {
	if (err) { return console.log(err); }
	console.log('Server OK');
});