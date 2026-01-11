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
} from "@/components/ui/index";
import { Edit, Trash2, Save, X } from "lucide-react";
import api from "../../../../config/api"; // ✅ centralized axios instance

type SocialLink = {
  _id?: string;
  platform: string;
  url: string;
};

const SOCIAL_PLATFORMS = ["Instagram", "Facebook", "Twitter", "LinkedIn"];

export default function SocialLinks() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newUrls, setNewUrls] = useState<{ [key: string]: string }>({});

  // Fetch links
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await api.get<SocialLink[]>("/links");
        setLinks(res.data || []);

        const urlMap: Record<string, string> = {};
        res.data.forEach((item) => {
          urlMap[item.platform] = item.url;
        });
        setNewUrls(urlMap);
      } catch (err) {
        console.error("Failed to fetch social links:", err);
      }
    };

    fetchLinks();
  }, []);

  // Save / Update link
  const saveLink = async (platform: string) => {
    const existing = links.find((l) => l.platform === platform);

    const payload = {
      platform,
      url: newUrls[platform] || "",
    };

    try {
      let res;

      if (existing?._id) {
        res = await api.put<SocialLink>(
          `/links/${existing._id}`,
          payload
        );

        setLinks((prev) =>
          prev.map((l) =>
            l.platform === platform ? res.data : l
          )
        );
      } else {
        res = await api.post<SocialLink>("/links", payload);
        setLinks((prev) => [...prev, res.data]);
      }

      setEditingIndex(null);
    } catch (err) {
      console.error("Failed to save link:", err);
    }
  };

  // Delete link
  const deleteLink = async (platform: string) => {
    const existing = links.find((l) => l.platform === platform);
    if (!existing?._id) return;

    try {
      await api.delete(`/links/${existing._id}`);

      setLinks((prev) =>
        prev.filter((l) => l.platform !== platform)
      );
      setNewUrls((prev) => ({ ...prev, [platform]: "" }));
    } catch (err) {
      console.error("Failed to delete link:", err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Links</CardTitle>
        <CardDescription>
          Manage footer social media links
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {SOCIAL_PLATFORMS.map((platform, index) => {
            const isEditing = editingIndex === index;

            return (
              <div
                key={platform}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                {isEditing ? (
                  <div className="flex-1">
                    <Label>{platform} URL</Label>
                    <Input
                      className="mt-1"
                      placeholder={`${platform} URL`}
                      value={newUrls[platform] || ""}
                      onChange={(e) =>
                        setNewUrls({
                          ...newUrls,
                          [platform]: e.target.value,
                        })
                      }
                    />

                    <div className="flex gap-2 mt-3">
                      <Button onClick={() => saveLink(platform)}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingIndex(null)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-semibold">{platform}</p>
                      {newUrls[platform] ? (
                        <a
                          href={newUrls[platform]}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-blue-500 underline"
                        >
                          {newUrls[platform]}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No link added
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingIndex(index)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {newUrls[platform] ? "Edit" : "Add"}
                      </Button>

                      {newUrls[platform] && (
                        <Button
                          variant="outline"
                          onClick={() => deleteLink(platform)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
