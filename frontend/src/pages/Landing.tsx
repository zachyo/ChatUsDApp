import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-chat-background via-chat-surface to-chat-surface-elevated">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-hero rounded-full mb-6 shadow-elegant">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-6">
            Lunar Chat
          </h1>
          <p className="text-xl text-chat-text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            Experience the future of decentralized communication. Connect your wallet, 
            register your unique .lunar identity, and start chatting securely on the blockchain.
          </p>
          <Button 
            variant="hero" 
            size="hero" 
            onClick={() => navigate('/auth')}
            className="hover:animate-none"
          >
            Start Chatting
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-surface p-8 rounded-2xl shadow-card border border-chat-border hover:shadow-elegant transition-all duration-300">
            <div className="w-12 h-12 bg-chat-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-chat-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-chat-text">Decentralized & Secure</h3>
            <p className="text-chat-text-muted">
              Your messages are stored on the blockchain, ensuring complete privacy and censorship resistance.
            </p>
          </div>
          
          <div className="bg-gradient-surface p-8 rounded-2xl shadow-card border border-chat-border hover:shadow-elegant transition-all duration-300">
            <div className="w-12 h-12 bg-chat-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-chat-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-chat-text">Unique Identity</h3>
            <p className="text-chat-text-muted">
              Register your personalized .lunar name and showcase your profile with IPFS-hosted images.
            </p>
          </div>
          
          <div className="bg-gradient-surface p-8 rounded-2xl shadow-card border border-chat-border hover:shadow-elegant transition-all duration-300">
            <div className="w-12 h-12 bg-chat-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-chat-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-chat-text">Real-time Messaging</h3>
            <p className="text-chat-text-muted">
              Enjoy instant private messages and group chats with real-time blockchain event updates.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center hidden">
          <div className="bg-gradient-surface p-8 rounded-2xl shadow-card border border-chat-border max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-chat-text">Ready to Join the Future?</h2>
            <p className="text-chat-text-muted mb-6">
              Connect your wallet and become part of the decentralized chat revolution.
            </p>
            <Button 
              variant="connect" 
              size="lg"
              onClick={() => navigate('/auth')}
            >
              Connect Wallet & Start
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;