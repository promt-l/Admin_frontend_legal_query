import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Label,
  Input,
  Textarea,
} from "@/components/ui/index";

import { Plus, Edit, Trash2 } from "lucide-react";
import axios from "axios";
import { API_URL } from "@/config/api";

type About = {
  _id?: string;
  shortDescription: string;
  description1: string;
  description2: string;
};

export default function AboutSection() {
  const [about, setAbout] = useState<About | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [shortDescription, setShortDescription] = useState("");
  const [description1, setDescription1] = useState("");
  const [description2, setDescription2] = useState("");

  // Fetch About section
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await axios.get(`${API_URL}/abouts`);

        // Backend returns array → pick the first entry
        const data = Array.isArray(res.data) ? res.data[0] : res.data;

        if (data) {
          setAbout(data);
          setShortDescription(data.shortDescription);
          setDescription1(data.description1);
          setDescription2(data.description2);
        } else {
          setAbout(null);
        }
      } catch (err) {
        console.error("Failed to fetch About section:", err);
      }
    };

    fetchAbout();
  }, []);

  // Save or Update
  const saveAboutSection = async () => {
  try {
    if (about?._id) {
      await axios.put(
        `${API_URL}/abouts/${about._id}`,
        { shortDescription, description1, description2 },
        { withCredentials: true }
      );
    } else {
      await axios.post(
        `${API_URL}/abouts`,
        { shortDescription, description1, description2 },
        { withCredentials: true }
      );
    }

    // Re-fetch (WITH credentials)
    const refetch = await axios.get(`${API_URL}/abouts`, {
      withCredentials: true,
    });

    const updated = Array.isArray(refetch.data)
      ? refetch.data[0]
      : refetch.data;

    setAbout(updated);
    setIsEditing(false);
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      alert("Unauthorized. Please login as admin again.");
    } else {
      console.error("Failed to save About section:", err);
    }
  }
};


  // Delete section
  const deleteAboutSection = async () => {
    if (!about?._id) {
      setAbout(null);
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/abouts/${about._id}`,
        { withCredentials: true }
      );
      setAbout(null);
    } catch (err) {
      console.error("Failed to delete About section:", err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>About Section</CardTitle>
        <CardDescription>Manage About page content</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!about ? (
            // Create new About Section
            <div className="space-y-4">
              <div>
                <Label>Short Description</Label>
                <Input
                  placeholder="Enter short intro text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />
              </div>

              <div>
                <Label>Description 1</Label>
                <Textarea
                  placeholder="Write first detailed paragraph..."
                  value={description1}
                  onChange={(e) => setDescription1(e.target.value)}
                />
              </div>

              <div>
                <Label>Description 2</Label>
                <Textarea
                  placeholder="Write second detailed paragraph..."
                  value={description2}
                  onChange={(e) => setDescription2(e.target.value)}
                />
              </div>

              <Button onClick={saveAboutSection}>
                <Plus className="h-4 w-4 mr-2" />
                Save About Section
              </Button>
            </div>
          ) : (
            // View or Edit existing About info
            <div className="border rounded-lg p-6 space-y-4 bg-muted">
              {isEditing ? (
                // Editing Mode
                <div className="space-y-4">
                  <div>
                    <Label>Short Description</Label>
                    <Input
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Description 1</Label>
                    <Textarea
                      value={description1}
                      onChange={(e) => setDescription1(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Description 2</Label>
                    <Textarea
                      value={description2}
                      onChange={(e) => setDescription2(e.target.value)}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={saveAboutSection}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Short Description</Label>
                    <p className="font-medium mt-1">{about.shortDescription}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Description 1</Label>
                    <p className="mt-1">{about.description1}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Description 2</Label>
                    <p className="mt-1">{about.description2}</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" onClick={deleteAboutSection}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
