import HomePage from '@/presentation/components/forRoutes/home/page'
import { FilterProvider } from '@/presentation/context/filter-context'

const Home = () => {
  return (
    <FilterProvider>
      <HomePage />
    </FilterProvider>
  )
}

export default Home
