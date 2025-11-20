import React, { useEffect, useState } from "react";
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
import { toast } from "@/components/ui/use-toast";
import { Lock, KeyRound, Home, Save, Eye, EyeOff } from "lucide-react";
import { Password, getAllPasswords, updatePassword } from "@/lib/password-service";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [passwordVisibility, setPasswordVisibility] = useState<Record<string, boolean>>({});

  // Load all passwords when component mounts
  useEffect(() => {
    const fetchPasswords = async () => {
      setIsLoading(true);
      try {
        const allPasswords = await getAllPasswords();
        console.log("Loaded passwords:", allPasswords);
        
        if (allPasswords.length > 0) {
          setPasswords(allPasswords);
          
          // Initialize form data
          const initialFormData: Record<string, string> = {};
          const initialVisibility: Record<string, boolean> = {};
          
          allPasswords.forEach(password => {
            initialFormData[password.key] = password.value;
            initialVisibility[password.key] = false;
          });
          
          console.log("Initial form data:", initialFormData);
          setFormData(initialFormData);
          setPasswordVisibility(initialVisibility);
        }
      } catch (error) {
        console.error("Error loading passwords:", error);
        toast({
          title: "Error",
          description: "Failed to load passwords. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPasswords();
  }, []);

  const loadPasswords = async () => {
    setIsLoading(true);
    try {
      const allPasswords = await getAllPasswords();
      console.log("Reloaded passwords:", allPasswords);
      setPasswords(allPasswords);
      
      // Update form data with new values
      const updatedFormData = { ...formData };
      allPasswords.forEach(password => {
        updatedFormData[password.key] = password.value;
      });
      console.log("Updated form data:", updatedFormData);
      setFormData(updatedFormData);
    } catch (error) {
      console.error("Error reloading passwords:", error);
      toast({
        title: "Error",
        description: "Failed to reload passwords. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const togglePasswordVisibility = (key: string) => {
    setPasswordVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedPasswords: string[] = [];
    const failedPasswords: string[] = [];
    
    // Update each password that changed
    await Promise.all(
      passwords.map(async (password) => {
        if (formData[password.key] !== password.value) {
          const success = await updatePassword(password.key, formData[password.key]);
          if (success) {
            updatedPasswords.push(password.key);
          } else {
            failedPasswords.push(password.key);
          }
        }
      })
    );
    
    // Show success message if any passwords were updated
    if (updatedPasswords.length > 0) {
      toast({
        title: "Settings Updated",
        description: `Successfully updated ${updatedPasswords.length} password(s).`,
      });
      
      // Reload passwords to get the latest values
      loadPasswords();
    }
    
    // Show error message if any updates failed
    if (failedPasswords.length > 0) {
      toast({
        title: "Update Failed",
        description: `Failed to update ${failedPasswords.length} password(s).`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      {/* Header */}
      <header className="bg-white border-b border-amber-200 p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img src="/lloogo.png" alt="The Best Valet" className="h-10 mr-3" />
            <h1 className="text-xl font-bold text-amber-800">Settings</h1>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="border-amber-200 text-amber-800"
              onClick={() => navigate("/")}
            >
              <Home className="h-5 w-5 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-8 px-4 flex-1">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-amber-800 flex items-center">
              <KeyRound className="h-6 w-6 mr-2" />
              Password Management
            </CardTitle>
            <CardDescription className="flex justify-between items-center">
              <span>Update the system passwords. These passwords are used for authentication across different parts of the application.</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadPasswords} 
                disabled={isLoading}
                className="text-xs"
              >
                Refresh Data
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading passwords...</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {passwords.map((password) => (
                  <div key={password.id} className="space-y-2">
                    <Label htmlFor={password.key} className="text-amber-700 capitalize">
                      {password.key.replace('_', ' ')} Password
                    </Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-amber-600" />
                        <Input
                          id={password.key}
                          type={passwordVisibility[password.key] ? "text" : "password"}
                          value={formData[password.key] || ''}
                          onChange={(e) => handleFormChange(password.key, e.target.value)}
                          className="pl-10 border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-2 h-8 w-8 p-0"
                          onClick={() => togglePasswordVisibility(password.key)}
                        >
                          {passwordVisibility[password.key] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {process.env.NODE_ENV === 'development' && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Current value: {password.value || 'empty'}, Form value: {formData[password.key] || 'empty'}
                        </div>
                      )}
                    </div>
                    {password.description && (
                      <p className="text-sm text-muted-foreground">{password.description}</p>
                    )}
                  </div>
                ))}
                <Button 
                  type="submit" 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white mt-6"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-amber-200 p-4 mt-auto">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="/lloogo.png"
              alt="The Best Valet"
              className="h-8 mr-3"
            />
            <span className="text-sm text-amber-800">The Best Valet</span>
          </div>
          <p className="text-sm text-amber-700">
            © {new Date().getFullYear()} Abdulrahman Saad
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Settings; 