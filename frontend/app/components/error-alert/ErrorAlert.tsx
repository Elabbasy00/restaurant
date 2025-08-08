import React from "react";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { FaBackward } from "react-icons/fa6";
import { ArrowLeft } from "lucide-react";

function ErrorAlert({ text }: { text: string }) {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto py-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-red-800 mb-2">{text}</h2>
        <p className="text-red-600">يرجى المحاولة مرة أخرى في وقت لاحق.</p>
        <Button
          variant="destructive"
          onClick={() => navigate(-1)}
          className="mt-4"
        >
          العودة <ArrowLeft />
        </Button>
      </div>
    </div>
  );
}

export default ErrorAlert;
