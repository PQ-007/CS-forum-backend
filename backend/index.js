import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

express().use(cors()).use(express.json());
dotenv.config();