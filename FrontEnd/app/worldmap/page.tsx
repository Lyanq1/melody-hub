'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import WorldMap from 'react-svg-worldmap'
import Link from 'next/link'

interface Disc {
  _id: string
  name: string
}
interface CountryDiscData {
  [iso2: string]: {
    count: number
    discs: Disc[]
  }
}
interface WorldMapDatum {
  country: string
  value: number
}

const VinylWorldMap = () => {
  const [data, setData] = useState<WorldMapDatum[]>([])
  const [countryDiscs, setCountryDiscs] = useState<CountryDiscData>({})
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  const fetchVinylInfo = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/product/countVinylByIso2')
      const rawData: CountryDiscData = response.data
      const formattedData: WorldMapDatum[] = Object.entries(rawData)
        .filter(([code]) => code.toLowerCase() !== 'unknown')
        .map(([country, value]) => ({
          country: country.toUpperCase(),
          value: value.count
        }))
      setData(formattedData)
      setCountryDiscs(rawData)
    } catch (error) {
      console.error('Error fetching Vinyl Info', error)
      toast.error('Failed to load Vinyl Info')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVinylInfo()
  }, [])

  // Panel close handler
  const closePanel = () => setSelectedCountry(null)

  // Handle country click
  const handleCountryClick = (context: { countryCode: string }) => {
    setSelectedCountry(context.countryCode)
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4'>
      <h1 className='text-3xl font-bold mb-4 text-center text-gray-800'>Vinyl Records by Country</h1>
      {loading ? (
        <div className='text-gray-600'>Loading map...</div>
      ) : (
        <div className='w-full md:w-[90%] lg:w-[80%] xl:w-[70%] relative'>
          <WorldMap color='#9810fa' size='xl' value-suffix='vinyls' data={data} onClickFunction={handleCountryClick} />
          {selectedCountry && countryDiscs[selectedCountry] && (
            <div className='absolute top-8 right-8 z-50 w-96 bg-[#1f1e1d] border border-gray-600 rounded-md shadow-lg max-h-96 overflow-y-auto'>
              <div className='flex justify-between items-center px-4 py-2 border-b border-gray-700'>
                <span className='text-white font-bold'>
                  {selectedCountry} ({countryDiscs[selectedCountry].count} vinyls)
                </span>
                <button onClick={closePanel} className='text-gray-400 hover:text-white'>
                  ✕
                </button>
              </div>
              <ul>
                {countryDiscs[selectedCountry].discs.map((disc) => (
                  <li
                    key={disc._id}
                    className='px-4 py-2 text-sm text-white hover:bg-[#3d3b3a] cursor-pointer transition duration-150'
                  >
                    <Link href={`/product/${disc._id}`}>{disc.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VinylWorldMap
