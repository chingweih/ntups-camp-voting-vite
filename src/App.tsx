import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Armchair, CloudOff } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Marquee from 'react-fast-marquee'
import { useQuery } from 'react-query'
import elected from './assets/elected.svg'
import logo from './assets/title.png'
import { Card, CardHeader, CardTitle } from './components/ui/card'
import { Progress } from './components/ui/progress'
import { Candidate, ElectionData } from './electionData.type'
import { colors, randomColors } from './lib/custom-colors'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'

function App() {
  const [time, setTime] = useState(new Date())

  const dataEndpointUrl =
    localStorage.getItem('flask_url') || 'http://127.0.0.1:5050/data'

  const {
    data: electionData,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['electionData'],
    queryFn: async () => {
      const response = await fetch(dataEndpointUrl, {
        method: 'get',
        mode: 'cors',
      })
      return response.json()
    },
  })

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date())
      refetch()
    }, 1000)
    return () => {
      clearInterval(intervalId)
    }
  })

  if (isError) {
    return (
      <div className='flex h-full max-h-full w-full items-center justify-center gap-5'>
        <Alert className='w-96'>
          <CloudOff className='h-4 w-4 text-red-400' />
          <AlertTitle>無法取得資料</AlertTitle>
          <AlertDescription>
            請在 {dataEndpointUrl} 開啟後端 API，
            <br />5 秒後將自動重試。
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <>
      <div className='m-0 flex h-full max-h-full w-full flex-col items-stretch justify-center gap-5 overflow-hidden bg-gradient-to-t from-zinc-600 via-zinc-800 to-zinc-900 p-8 text-slate-800'>
        <div className='flex h-20 rounded-md bg-white p-2'>
          <img src={logo} className='mx-2 h-full max-w-40 p-2' alt='logo' />
          <Marquee className='w-full'>
            {isLoading ? (
              <h2 className='text-lg font-semibold'>2024 臺大政治營</h2>
            ) : (
              <MarqueeContent electionData={electionData} />
            )}
          </Marquee>
        </div>
        {isLoading ? (
          <Loading />
        ) : (
          <Animation electionData={electionData}>
            <Legislative electionData={electionData} />
            <Presidential electionData={electionData} />
            <Proportional electionData={electionData} />
          </Animation>
        )}
        <div className='flex h-10 items-center gap-5 rounded-md bg-white p-2'>
          <Marquee className='w-full'>
            {isLoading ? '2024 臺大政治營' : electionData.ticker_text}
          </Marquee>
          <h2 className='pr-2 text-lg font-bold'>
            {String(time.getHours()).padStart(2, '0')}:
            {String(time.getMinutes()).padStart(2, '0')}
          </h2>
        </div>
      </div>
    </>
  )
}

function Animation({
  children,
  electionData,
}: {
  children: React.ReactNode
  electionData: ElectionData
}) {
  return (
    <motion.div
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ease: 'easeInOut', duration: 0.5 }}
      className='h-full'
      key={electionData.display_mode}
    >
      {children}
    </motion.div>
  )
}

function MarqueeContent({ electionData }: { electionData: ElectionData }) {
  return (
    <div className='flex flex-row items-center justify-center gap-5 px-5'>
      {electionData.legislative.areas.map((area) => {
        return (
          <div className='flex flex-row items-center justify-center gap-3'>
            <h2 className='text-lg font-semibold' key={area.area}>
              {area.area}
            </h2>
            {area.candidates.map((cand, index) => {
              return (
                <React.Fragment key={index}>
                  <div
                    className='flex h-5 w-5 items-center justify-center rounded-md text-white'
                    style={{ backgroundColor: randomColors[index] }}
                  >
                    {index + 1}
                  </div>
                  <h2>
                    {cand.name} {cand.votes} 票
                  </h2>
                </React.Fragment>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function Loading() {
  return (
    <div className='flex h-full max-h-full w-full items-center justify-center gap-5 text-white'>
      <h1 className='text-4xl font-bold'>載入中...</h1>
    </div>
  )
}

function WithBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex h-full flex-row items-center justify-center gap-5'>
      <video
        autoPlay
        loop
        muted
        className='h-full w-1/5 rounded-md object-cover'
        // style={{ maxHeight: '100%' }}
      >
        <source src='/banner.mp4' type='video/mp4' />
      </video>
      {children}
    </div>
  )
}

function Presidential({ electionData }: { electionData: ElectionData }) {
  if (electionData.display_mode !== 'presidential') {
    return null
  }

  return (
    <WithBanner>
      <div className='flex h-full w-full flex-row gap-5'>
        {electionData.presidential.candidates.map((cand, index) => {
          return <CandCard cand={cand} index={index} key={cand.name} />
        })}
      </div>
    </WithBanner>
  )
}

function Proportional({ electionData }: { electionData: ElectionData }) {
  if (electionData.display_mode !== 'proportional') {
    return null
  }

  const parties = Object.entries(electionData.proportional.seats).map(
    ([party, { seats, percentage }], index) => {
      return { party, seats, percentage, color: randomColors[index] }
    },
  )

  const seatFromVotes: string[] = []

  parties.forEach((party) => {
    seatFromVotes.push(...Array(party.seats).fill(party.color))
  })

  const seatsColor = Array.from({
    length: electionData.proportional.total_seats,
  }).map((_, index) => {
    if (index <= seatFromVotes.length - 1) {
      return seatFromVotes[index]
    } else {
      return colors.twPrimary
    }
  })

  return (
    <WithBanner>
      <div className='flex h-full w-full flex-col items-center justify-center gap-10 rounded-md bg-white p-10'>
        <h2 className='text-2xl font-bold'>不分區開票</h2>
        <div className='flex flex-row gap-2'>
          {seatsColor.map((color) => {
            return <Armchair size={80} color={color} />
          })}
        </div>
        <div className='flex w-full flex-col items-start justify-center gap-3 pt-5'>
          {parties.map((party) => {
            return (
              <div className='flex w-full flex-row items-center justify-between'>
                <div className='flex w-2/6 flex-row items-center justify-start gap-2'>
                  <div
                    className='m-1 h-8 w-8 rounded-full'
                    style={{ backgroundColor: party.color }}
                  ></div>
                  <h2 className='text-lg font-bold'>{party.party}</h2>
                </div>
                <Progress
                  value={Math.min(party.percentage * 1.5, 100)}
                  className='w-3/5'
                  color={party.color}
                />
                <p className='w-1/5 px-5 text-left'>
                  <span className='text-2xl font-bold'>
                    <CountUp end={party.seats} duration={2} /> 席
                  </span>{' '}
                  / <CountUp end={party.percentage} duration={2} /> %
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </WithBanner>
  )
}

function Legislative({ electionData }: { electionData: ElectionData }) {
  if (electionData.display_mode !== 'legislative') {
    return <></>
  }

  return (
    <div className='flex h-full w-full items-stretch justify-center gap-5'>
      {electionData.legislative.areas.map((area) => {
        const validVotes = area.candidates.reduce(
          (acc, curr) => acc + curr.votes,
          0,
        )
        const totalVotes = area.total_votes

        return (
          <div
            className='flex w-full flex-grow flex-col justify-center gap-5'
            key={area.area}
          >
            <Card className='w-full'>
              <CardHeader>
                <div className='flex flex-row items-center justify-between'>
                  <CardTitle>{area.area}</CardTitle>
                  <p>
                    已開{' '}
                    <span className='text-2xl font-bold'>
                      <CountUp end={validVotes} duration={2} />
                    </span>
                    /{totalVotes}
                  </p>
                </div>
              </CardHeader>
            </Card>
            {area.candidates.map((cand, index) => {
              return <CandCard cand={cand} index={index} key={cand.name} />
            })}
          </div>
        )
      })}
    </div>
  )
}

function CandCard({ cand, index }: { cand: Candidate; index: number }) {
  const bgColor = randomColors[index]

  return (
    <Card key={cand.name} className='w-full'>
      <CardHeader className='flex h-full flex-col justify-center gap-3'>
        <div className='flex flex-row items-center justify-between'>
          <div className='flex flex-row items-center justify-start gap-5'>
            <div
              className='flex h-10 w-10 items-center justify-center rounded-md p-5 text-white'
              style={{ backgroundColor: bgColor }}
            >
              {index + 1}
            </div>
            <CardTitle>{cand.name}</CardTitle>
            {cand.elected ? <img src={elected} className='h-8' /> : null}
          </div>
        </div>
        {cand.picture_url ? (
          <img src={cand.picture_url} className='w-full rounded-md' />
        ) : null}
        <div className='flex flex-row items-center justify-between'>
          <div className='flex w-1/2 flex-row items-center justify-start gap-2'>
            <Progress
              value={Math.min(cand.percentage * 2, 100)}
              className='m-0'
              color={bgColor}
            />
            <p>{cand.percentage}%</p>
          </div>
          <CardTitle className='m-0'>
            <span className='text-4xl'>
              <CountUp end={cand.votes} duration={2} />
            </span>
            {'  '}票
          </CardTitle>
        </div>
      </CardHeader>
    </Card>
  )
}

export default App
