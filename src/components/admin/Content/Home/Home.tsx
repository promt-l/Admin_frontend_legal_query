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
  Plus,
  Edit,
  Trash2,
} from "@/components/ui/index";
import api from "../../../../config/api"; // ✅ centralized axios instance

type Home = {
  _id?: string;
  heading: string;
  subHeading: string;
  lastUpdated?: string;
};

export default function Home() {
  const [homeSection, setHomeSection] = useState<Home | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [heading, setHeading] = useState("");
  const [subHeading, setSubHeading] = useState("");

  // Fetch from backend
  useEffect(() => {
    const fetchHomeSection = async () => {
      try {
        const res = await api.get<Home | null>("/home");
        if (res.data) {
          setHomeSection(res.data);
          setHeading(res.data.heading);
          setSubHeading(res.data.subHeading);
        } else {
          setHomeSection(null);
        }
      } catch (err) {
        console.error("Failed to fetch home section:", err);
      }
    };

    fetchHomeSection();
  }, []);

  // Save or update
  const saveHomeSection = async (heading: string, subHeading: string) => {
    try {
      let res;

      if (homeSection?._id) {
        res = await api.put<Home>(`/home/${homeSection._id}`, {
          heading,
          subHeading,
        });
      } else {
        res = await api.post<Home>("/home", {
          heading,
          subHeading,
        });
      }

      setHomeSection(res.data);
      setHeading(res.data.heading);
      setSubHeading(res.data.subHeading);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save home section:", err);
    }
  };

  // Delete
  const deleteHomeSection = async () => {
    if (!homeSection?._id) {
      setHomeSection(null);
      return;
    }

    try {
      await api.delete(`/home/${homeSection._id}`);
      setHomeSection(null);
      setHeading("");
      setSubHeading("");
    } catch (err) {
      console.error("Failed to delete home section:", err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Home Section</CardTitle>
        <CardDescription>
          Manage homepage heading and subheading
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {!homeSection ? (
            /* Create mode */
            <div className="space-y-4">
              <div>
                <Label>Heading</Label>
                <Input
                  placeholder="Enter main heading"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                />
              </div>

              <div>
                <Label>Subheading</Label>
                <Input
                  placeholder="Enter subheading"
                  value={subHeading}
                  onChange={(e) => setSubHeading(e.target.value)}
                />
              </div>

              <Button
                onClick={() => {
                  if (heading && subHeading) {
                    saveHomeSection(heading, subHeading);
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Save Home Section
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg p-6 space-y-4 bg-muted">
              {isEditing ? (
                /* Edit mode */
                <div className="space-y-4">
                  <div>
                    <Label>Heading</Label>
                    <Input
                      value={heading}
                      onChange={(e) => setHeading(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Subheading</Label>
                    <Input
                      value={subHeading}
                      onChange={(e) => setSubHeading(e.target.value)}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() =>
                        saveHomeSection(heading, subHeading)
                      }
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">
                      Heading
                    </Label>
                    <p className="text-lg font-semibold mt-1">
                      {homeSection.heading}
                    </p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">
                      Subheading
                    </Label>
                    <p className="mt-1">
                      {homeSection.subHeading}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={deleteHomeSection}
                    >
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
