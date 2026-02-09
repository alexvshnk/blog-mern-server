import PostModel from '../models/Post.js';


export const getLastTags = async (req, res) => {
    try {
        const posts = await PostModel.find().limit(5).exec();

        const tags = posts
            .map((obj) => obj.tags)
            .flat()
            .slice(0, 5);

        res.json(tags);
    } catch (err) {
        res.status(500).json({ message: 'Не удалость получить статьи' });
    }
}

export const create = async (req, res) => {
    try {
        const doc = new PostModel({
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags.split(','),
            user: req.userId
        });

        const post = await doc.save();

        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ message: 'Не удалось создать статью' });
    }
};

export const getAll = async (req, res) => {
    try {
        const posts = await PostModel.find().populate({
            path: 'user',
            select: ['fullName', 'avatarUrl']
        });

        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Не удалость получить статьи' });
    }
};

export const getOne = async (req, res) => {
    try {
        const postId = req.params.id;

        PostModel.findOneAndUpdate(
            {
                _id: postId
            },
            {
                $inc: { viewsCount: 1 },
            },
            {
                returnDocument: 'after',
            })
            .populate({
                path: 'user',
                select: ['fullName', 'avatarUrl']
            })
            .then(doc => {
                if (!doc) {
                    return res.status(404).json({ message: 'Статья не найдена' });
                }
                res.json(doc);
            })
            .catch(err => {
                console.log(err);
                return res.status(500).json({ message: 'Не удалось получить статью' });
            });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Не удалость получить статью' });
    }
};

export const remove = async (req, res) => {
    try {
        const postId = req.params.id;

        PostModel.findOneAndDelete({
            _id: postId
        }).then(doc => {
            if (!doc) {
                return res.status(404).json({ message: 'Статья не найдена' });
            }
            res.json({ message: 'Статья была успешно удалена' });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ message: 'Не удалось удалить статью' });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Не удалость получить статью' });
    }
};

export const update = async (req, res) => {
    try {
        const postId = req.params.id;

        await PostModel.updateOne({
            _id: postId,
        },
            {
                title: req.body.title,
                text: req.body.text,
                imageUrl: req.body.imageUrl,
                user: req.userId,
                tags: req.body.tags.split(',')
            }
        );

        res.json({ message: 'Статья была обновлена' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Не удалость обновить статью' });
    }
}