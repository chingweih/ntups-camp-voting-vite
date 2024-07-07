import { useEffect, useState } from 'react'
import Marquee from 'react-fast-marquee'
import { useQuery } from 'react-query'
import { VictoryPie } from 'victory'
import banner from './assets/banner.png'
import elected from './assets/elected.svg'
import logo from './assets/title.png'
import { Card, CardHeader, CardTitle } from './components/ui/card'
import { colors } from './lib/custom-colors'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CloudOff } from 'lucide-react'

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

  const {
    data: electionData,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['electionData'],
    queryFn: async () => {
      const response = await fetch('http://127.0.0.1:5050/data', {
        method: 'get',
        mode: 'cors',
      })
      return response.json()
    },
  })

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date())
    }, 60000)
    return () => {
      clearInterval(intervalId)
    }
  })

  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch()
    }, 5000)
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
            請在 http://127.0.0.1:5050 開啟後端伺服器，
            <br />5 秒後將自動重試。
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <>
      <div className='m-0 flex h-full max-h-full w-full flex-col items-stretch justify-center gap-2 overflow-hidden bg-gradient-to-t from-zinc-600 via-zinc-800 to-zinc-900 p-8 text-slate-800'>
        <div className='flex h-20 rounded-md bg-white p-2'>
          <img src={logo} className='mx-2 h-full max-w-40 p-2' alt='logo' />
          <Marquee className='w-full'>
            <h2 className='text-lg font-semibold'>
              {isLoading ? '2024 臺大政治營' : electionData.ticker_text}
            </h2>
          </Marquee>
        </div>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <Legislative electionData={electionData} />
            <Presidential electionData={electionData} />
            <Proportional electionData={electionData} />
          </>
        )}
        <div className='flex h-20 items-center gap-5 rounded-md bg-white p-2'>
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

function Loading() {
  return (
    <div className='flex h-full max-h-full w-full items-center justify-center gap-5 text-white'>
      <h1 className='text-4xl font-bold'>載入中...</h1>
    </div>
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
          <div
            className='flex flex-grow flex-col justify-center gap-5'
            key={area.area}
          >
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
