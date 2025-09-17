import React, { useState, useEffect } from "react";
import {
  useAccount,
  useConnect,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { watchContractEvent } from "wagmi/actions";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useChatContext } from "@/context/ChatContext";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { config } from "@/lib/wagmi";
import { uploadToIPFS } from "@/lib/ipfs";
import { Upload, Wallet, User, Loader2 } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Auth = () => {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, setLoading, setCurrentUser } = useChatContext();

  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  console.log(address);
  const { writeContract } = useWriteContract();

  // Redirect if user is already registered
  useEffect(() => {
    if (isConnected && currentUser?.isRegistered) {
      navigate("/chat");
    }
  }, [isConnected, currentUser, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !profileImage) {
      toast({
        title: "Missing Information",
        description: "Please provide both display name and profile image.",
        variant: "destructive",
      });
      return;
    }

    setIsRegistering(true);
    setLoading(true);

    try {
      // Upload image to IPFS
      setIsUploading(true);
      const imageHash = await uploadToIPFS(profileImage);
      setIsUploading(false);

      const unwatch = watchContractEvent(config, {
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        eventName: "UserRegistered",
        onLogs: (logs) => {
          const log = logs.find(
            (l) => (l as any).args.userAddress === address
          );
          if (log) {
            const { userAddress, displayName, ensName } = (log as any).args;
            toast({
              title: "Registration Confirmed",
              description: "You have successfully registered on Lunar Chat.",
            });
            setCurrentUser({
              userAddress,
              displayName: displayName,
              ensName,
              isRegistered: true,
              profileImageHash: imageHash,
            });
            navigate("/chat");
            unwatch();
          }
        },
      });

      // Register user on contract
      writeContract(
        {
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "registerUser",
          args: [displayName.trim(), imageHash],
        } as any,
        {
          onSuccess: () => {
            toast({
              title: "Registration Submitted",
              description: "Please confirm the transaction in your wallet.",
            });
          },
          onError: (err) => {
            console.error("Registration error:", err);
            toast({
              title: "Registration Failed",
              description:
                "Failed to submit transaction. Please try again.",
              variant: "destructive",
            });
            setIsRegistering(false);
            setLoading(false);
            unwatch();
          },
        }
      );
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "Failed to register user. Please try again.",
        variant: "destructive",
      });
      setIsRegistering(false);
      setIsUploading(false);
      setLoading(false);
    }
  };

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: "UserRegistered",
    onLogs: (logs) => {
      const { userAddress, displayName, ensName } = logs[0].args;
      if (userAddress === address) {
        toast({
          title: "Registration Confirmed",
          description: "You have successfully registered on Lunar Chat.",
        });
        setCurrentUser({
          userAddress,
          displayName: displayName,
          ensName,
          isRegistered: true,
          profileImageHash: ""
        });
        navigate("/chat");
      }
    },
  });

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-chat-background via-chat-surface to-chat-surface-elevated flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elegant border-chat-border">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
            <CardDescription>
              Choose your preferred wallet to get started with Lunar Chat
            </CardDescription>
          </CardHeader>
          <CardContent className="items-center justify-center flex">
            <ConnectButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-chat-background via-chat-surface to-chat-surface-elevated flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant border-chat-border">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Create Your Profile</CardTitle>
          <CardDescription>
            Register your unique .lunar identity to start chatting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Display Name Input */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                required
                className="bg-chat-surface border-chat-border focus:border-chat-primary"
              />
              <p className="text-sm text-chat-text-muted">
                Your name will appear as: {displayName.trim() || "yourname"}
                .lunar
              </p>
            </div>

            {/* Profile Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="profileImage">Profile Picture</Label>
              <div className="border-2 relative border-dashed border-chat-border rounded-lg p-6 text-center hover:border-chat-primary transition-colors">
                {imagePreview ? (
                  <div className="space-y-3">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-chat-primary"
                    />
                    <p className="text-sm text-chat-text-muted">
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 mx-auto text-chat-text-muted" />
                    <p className="text-chat-text-muted">
                      Drop your image here or click to browse
                    </p>
                  </div>
                )}
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isRegistering || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Uploading Image...
                </>
              ) : isRegistering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Registering...
                </>
              ) : (
                "Register & Start Chatting"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
