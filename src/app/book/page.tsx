import BookingChatbot from '@/components/chatbot/BookingChatbot';

export default function BookPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Book an Appointment</h1>
      <BookingChatbot />
    </div>
  );
}