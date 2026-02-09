"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Assuming this exists or using Input for now if not
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface EditProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
    const { user, updateProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Form state safely initialized from user
    const [formData, setFormData] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
        location: user?.location || "",
        role: user?.role || "",
        bio: user?.bio || ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateProfile(formData);
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="District, State"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Input
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            placeholder="Farmer, Trader, etc."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Tell us about yourself..."
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
