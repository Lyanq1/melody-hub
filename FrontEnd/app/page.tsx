import { ProductCard } from '@/components/ui/product-card'


export default function Home() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <ProductCard 
        id="1"
        name="LISA - ALTER EGO (VINYL LP) - ĐĨA THAN"
        price={100}
        description="LISA - ALTER EGO (VINYL LP) - ĐĨA THAN"
        imageUrl="https://product.hstatic.net/1000304920/product/lisa-album-lisa-alter-ego-vinyl-ver-39298202370229_0e91f219ace3411c9ccaabbae202703f_master.jpg"
      />
      <ProductCard 
        id="2"
        name="THE WEEKND - HURRY UP TOMORROW (VINYL LP) - ĐĨA THAN"
        price={200}
        description="THE WEEKND - HURRY UP TOMORROW (VINYL LP) - ĐĨA THAN"
        imageUrl="https://product.hstatic.net/1000304920/product/the-weeknd-hurry-up-tomorrow-vinyl-lp-dia-than_a434a6a8c5e9450ab8338f8b1e478d4c_master.png"
      />
      <ProductCard 
        id="3"
        name="SOOBIN - BAT NO LEN (VINYL LP) - ĐĨA THAN"
        price={300}
        description="SOOBIN - BAT NO LEN (VINYL LP) - ĐĨA THAN"
        imageUrl="https://product.hstatic.net/1000304920/product/soobin_-_bat_no_len__translucent__22secret_22_color_vinyl__-_dia_than_9221182c939848f0a73300ee561e7cdc_grande.jpg"
      />
       
    </div>
    
  )
}


 