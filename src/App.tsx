import { useEffect, useState } from 'react'
import Marquee from 'react-fast-marquee'
import { VictoryPie } from 'victory'
import banner from './assets/banner.png'
import elected from './assets/elected.svg'
import logo from './assets/title.png'
import { Card, CardHeader, CardTitle } from './components/ui/card'
import { colors } from './lib/custom-colors'

type ElectionData = {
  presidential: {
    candidates: { name: string; votes: number }[]
  }
  legislative: {
    areas: {
      area: string
      candidates: { name: string; votes: number }[]
    }[]
  }
  proportional: {
    seats: {
      [party: string]: { seats: number; percentage: number }
    }
    total_seats: number
    total_votes: number
    registered_voters: number
  }
  ticker_text: string
  display_mode: 'presidential' | 'legislative' | 'proportional'
}

function App() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date())
    }, 60000)
    return () => {
      clearInterval(intervalId)
    }
  })

  const [electionData, setElectionData] = useState<ElectionData>({
    presidential: {
      candidates: [
        { name: '唐子涵/吳亞旗', votes: 0 },
        { name: '張璿婷/陳宣宇', votes: 0 },
        { name: '鄭大邦/王宇彤', votes: 0 },
      ],
    },
    legislative: {
      areas: [
        {
          area: '選區一',
          candidates: [
            { name: '哈囉', votes: 1 },
            { name: '莊宸綾', votes: 0 },
            { name: '謝啟昱', votes: 0 },
          ],
        },
        {
          area: '選區一',
          candidates: [
            { name: '哈囉', votes: 0 },
            { name: '莊宸綾', votes: 0 },
            { name: '謝啟昱', votes: 0 },
          ],
        },
        {
          area: '選區一',
          candidates: [
            { name: '哈囉', votes: 0 },
            { name: '莊宸綾', votes: 0 },
            { name: '謝啟昱', votes: 0 },
          ],
        },
        {
          area: '選區一',
          candidates: [
            { name: '哈囉', votes: 0 },
            { name: '莊宸綾', votes: 0 },
            { name: '謝啟昱', votes: 0 },
          ],
        },
      ],
    },
    proportional: {
      seats: {
        建制派: { seats: 0, percentage: 50 },
        中間: { seats: 0, percentage: 10 },
        左派: { seats: 0, percentage: 40 },
      },
      total_seats: 10,
      total_votes: 300,
      registered_voters: 13452016,
    },
    ticker_text: '投票時間結束 各開票所陸續回報狀態中',
    display_mode: 'proportional',
  })

  return (
    <>
      <div className='m-0 flex h-full max-h-full w-full flex-col items-stretch justify-center gap-2 overflow-hidden bg-gradient-to-t from-zinc-600 via-zinc-800 to-zinc-900 p-8 text-slate-800'>
        <div className='flex h-20 rounded-md bg-white p-2'>
          <img src={logo} className='mx-2 h-full max-w-40 p-2' alt='logo' />
          <Marquee className='w-full'>
            <h2 className='text-lg font-semibold'>
              {electionData.ticker_text}
            </h2>
          </Marquee>
        </div>
        <Legislative electionData={electionData} />
        <Presidential electionData={electionData} />
        <Proportional electionData={electionData} />
        <div className='flex h-20 items-center gap-5 rounded-md bg-white p-2'>
          <Marquee className='w-full'>{electionData.ticker_text}</Marquee>
          <h2 className='pr-2 text-lg font-bold'>
            {String(time.getHours()).padStart(2, '0')}:
            {String(time.getMinutes()).padStart(2, '0')}
          </h2>
        </div>
      </div>
    </>
  )
}

function WithBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex h-full max-h-full flex-row items-center justify-center gap-5'>
      <img
        src={banner}
        className='rounded-md object-contain'
        style={{ height: 'calc(100vh - 265px)' }}
      />
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
      <div className='flex w-full flex-col gap-5'>
        {electionData.presidential.candidates.map((cand, index) => {
          return (
            <Card key={cand.name} className='h-full w-full py-3'>
              <CardHeader className='gap-5'>
                <div className='flex flex-row items-center justify-between'>
                  <div className='flex flex-row items-center justify-start gap-5'>
                    <div
                      className='flex h-10 w-10 items-center justify-center rounded-md p-5 text-white'
                      style={{ backgroundColor: colors.primaryBlue }}
                    >
                      {index + 1}
                    </div>
                    <CardTitle>{cand.name}</CardTitle>
                  </div>
                  <img src={elected} className='h-6' />
                </div>
                <div className='flex flex-row items-center justify-end'>
                  <CardTitle>
                    {Math.floor(cand.votes / 10000)} 萬{' '}
                    {String(cand.votes % 10000).padStart(4, '0')} 票
                  </CardTitle>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </WithBanner>
  )
}

function Proportional({ electionData }: { electionData: ElectionData }) {
  if (electionData.display_mode !== 'proportional') {
    return null
  }

  const pieData = Object.entries(electionData.proportional.seats).map(
    ([party, { seats, percentage }]) => ({
      x: party,
      y: percentage,
      seats,
    }),
  )

  return (
    <WithBanner>
      <div className='relative rounded-md bg-white'>
        <h2
          className='absolute left-3 top-3 rounded-md px-5 py-3 text-lg font-bold text-white'
          style={{ backgroundColor: colors.primaryBlue }}
        >
          不分區選舉結果
        </h2>
        <VictoryPie
          data={pieData}
          labels={({ datum }) =>
            `${datum.x}：${parseInt(datum.y)}% (${datum.seats})`
          }
          labelRadius={50}
          animate={{
            duration: 2000,
          }}
          colorScale={[
            colors.primaryBlue,
            colors.primaryOrgange,
            'navy',
            'cyan',
            'navy',
          ]}
          height={550}
          width={1000}
          style={{
            labels: {
              fill: 'white',
            },
          }}
        />
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
        return (
          <div className='flex flex-grow flex-col justify-center gap-5'>
            <Card className='w-full'>
              <CardHeader>
                <CardTitle>{area.area}</CardTitle>
              </CardHeader>
            </Card>
            {area.candidates.map((cand, index) => {
              return (
                <Card key={cand.name} className='w-full'>
                  <CardHeader className='gap-5'>
                    <div className='flex flex-row items-center justify-between'>
                      <div className='flex flex-row items-center justify-start gap-5'>
                        <div
                          className='flex h-10 w-10 items-center justify-center rounded-md p-5 text-white'
                          style={{ backgroundColor: colors.primaryBlue }}
                        >
                          {index + 1}
                        </div>
                        <CardTitle>{cand.name}</CardTitle>
                      </div>
                      <img src={elected} className='h-6' />
                    </div>
                    <div className='flex flex-row items-center justify-end'>
                      <CardTitle>
                        {Math.floor(cand.votes / 10000)} 萬{' '}
                        {String(cand.votes % 10000).padStart(4, '0')} 票
                      </CardTitle>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default App
