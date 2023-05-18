import express from "express"
import {PrismaClient} from '@prisma/client'
import cors from 'cors'
import { convertHoursStringToMinutes } from "./utils/convert-hour-string-to-minutes"
import { convertMinutesToHoursString } from "./utils/convert-minutes-to-hour-string"


const app = express()
app.use( express.json())
app.use(cors())


const prisma = new PrismaClient({
  log: ['query']
})


app.get("/games", async (request, response)=> {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,

        }
      }
    }
  })

  return response.json(games);
})

app.get("/games/:id", async (request, response) => {
  const id = request.params.id;
  const game = await prisma.game.findFirst({
    select: {
      bannerUrl: true,
      title: true,
    },
    where: {
      id,
    },
  })

  if(!game) {
    return response.json();
  }

  return response.json(game);

})

app.get('/games/:id/ads', async (request, response) => {
  const gameId = request.params.id;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      hourEnd: true,
      hourStart: true,
      yearsPlaying: true,
      useVoiceChannel: true,
    },
    where: {
      gameId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  
  return response.json(ads.map(ad => {
    return {
      ...ad,
      weekDays: ad.weekDays.split(','),
      hourStart: convertMinutesToHoursString(ad.hourStart),
      hourEnd: convertMinutesToHoursString(ad.hourEnd),
    }
  }));
})

app.post('/games/:id/ads', async (request, response) => {

  const gameId = request.params.id;
  const body: any = request.body;

  
  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weekDays: body.weekDays.join(','),
      hourStart: convertHoursStringToMinutes(body.hourStart),
      hourEnd: convertHoursStringToMinutes(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel,
    }
  })

  return response.status(201).json(ad);
})

app.get('/ads/:id/discord', async (request, response) => {
  const adId = request.params.id;

  const  ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true,
    },
    where: {
      id: adId,
    },
  })
  
  return response.json({
    discord: ad.discord,
  });
})






app.listen(3333)