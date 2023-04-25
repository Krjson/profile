const express = require('express');
const router = express.Router();
const UserDetails = require('../models/userDetails'); // добавляем импорт модели
const User = require('../models/user'); // добавляем импорт модели


router.get('/', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }

    res.render('dashboard', { session: req.session });
});

router.get('/user-data', (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }

    res.render('userDataForm', { session: req.session });
});

router.post('/user-data', async (req, res) => {
    if (req.session.user.role !== 'admin') {
      return res.redirect('/dashboard');
    }
  
    try {
      // Ищем запись о пользователе
      let userDetails = await UserDetails.findOne({ user: req.session.user._id });
  
      // Если запись не найдена, создаем новую
      if (!userDetails) {
        userDetails = new UserDetails({
          nickname: req.body.nickname,
          avatarUrl: req.body.avatarUrl,
          about: req.body.about,
          user: req.session.user._id,
        });
      }
      // Если запись найдена, обновляем ее поля
      else {
        userDetails.nickname = req.body.nickname;
        userDetails.avatarUrl = req.body.avatarUrl;
        userDetails.about = req.body.about;
      }
  
      await userDetails.save(); // сохраняем изменения в базе данных
  
      // Обновляем запись о пользователе в коллекции User
      const user = await User.findById(req.session.user._id);
      user.userDetails = userDetails._id;
      await user.save();
  
      res.redirect('/dashboard');
    } catch (error) {
      console.error(error);
      res.status(500).send('Ошибка на сервере');
    }
  });

router.get('/profile/:id', async (req, res) => {
    const userDetails = await UserDetails.findOne({ user: req.params.id }).populate('user');
    if (!userDetails) {
        return res.redirect('/dashboard');
    }

    res.render('userProfile', { session: req.session, userDetails });
});

module.exports = router;