export type Candidate = {
  name: string
  votes: number
  percentage: number
  elected: boolean
  picture_url?: string
  num: number
  color: string
}

export type ElectionData = {
  presidential: {
    candidates: Candidate[]
    total_votes: number
  }
  legislative: {
    areas: {
      area: string
      candidates: Candidate[]
      total_votes: number
    }[]
  }
  proportional: {
    seats: {
      [party: string]: {
        seats: number
        percentage: number
        num: number
        color: string
      }
    }
    total_seats: number
    total_votes: number
  }
  ticker_text: string
  display_mode: 'presidential' | 'legislative' | 'proportional'
}
