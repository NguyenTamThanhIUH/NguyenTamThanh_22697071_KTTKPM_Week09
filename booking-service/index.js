import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Sequelize, DataTypes } from 'sequelize';

const app = express();
const PORT = process.env.PORT || 8083;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const sequelize = new Sequelize(
  process.env.DB_NAME || 'travel_booking',
  process.env.DB_USER || 'user',
  process.env.DB_PASS || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: { type: DataTypes.STRING, allowNull: false },
  tourId: { type: DataTypes.STRING, allowNull: false },
  totalPrice: { type: DataTypes.FLOAT, allowNull: false },
  status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED'),
    defaultValue: 'PENDING'
  },
  bookingDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

const initDb = async (retries = 5) => {
  while (retries) {
    try {
      await sequelize.authenticate();
      await sequelize.sync({ alter: true });
      console.log('Booking database synced');
      break;
    } catch (error) {
      console.error(`Unable to connect to the database (Retries left: ${retries - 1}):`, error.message);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

initDb();

// Create Booking
app.post('/bookings', async (req, res) => {
  try {
    const { userId, tourId, totalPrice } = req.body;
    const booking = await Booking.create({ userId, tourId, totalPrice });
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Booking Status
app.patch('/bookings/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    if (booking) {
      booking.status = status;
      await booking.save();
      res.json(booking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get User Bookings
app.get('/bookings/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.findAll({ where: { userId: req.params.userId } });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Booking Service running on port ${PORT}`);
});
