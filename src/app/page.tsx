import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold">MM</span>
          <span className="text-lg tracking-wide">MODERN MEN HAIR SALON</span>
        </div>
        <nav className="flex gap-6 text-sm uppercase">
          <Link href="#">Home</Link>
          <Link href="#">Services</Link>
          <Link href="#">Barbers</Link>
          <Link href="#">Gallery</Link>
          <Link href="#">Contact Us</Link>
        </nav>
        <Link
          href="#"
          className="border border-white px-4 py-2 rounded hover:bg-white hover:text-black transition"
        >
          Appointment
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative w-full h-screen">
        <Image
          src="https://placehold.co/1920x1080/000000/FFFFFF/png"
          alt="Barbershop interior"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-5xl font-bold mb-4">TIME FOR A NEW LOOK?</h1>
          <p className="text-lg mb-6">Book your next haircut or shave with our expert barbers.</p>
          <div className="flex gap-4">
            <Link href="#" className="bg-white text-black px-6 py-3 rounded hover:bg-gray-200 transition">Book Online</Link>
            <Link href="#" className="bg-white text-black px-6 py-3 rounded hover:bg-gray-200 transition">Call Now</Link>
            <Link href="#" className="bg-white text-black px-6 py-3 rounded hover:bg-gray-200 transition">WhatsApp Us</Link>
          </div>
          <p className="mt-6 text-gray-300 text-sm">Walk-ins welcome, appointments preferred.</p>
        </div>
      </section>
    </main>
  );
}