
import EmailConverter from "@/components/EmailConverter";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">
          카카오 텍스트 포맷 변환기
        </h1>
        <EmailConverter />
      </div>
    </div>
  );
};

export default Index;
