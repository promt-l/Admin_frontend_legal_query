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
import { Edit, X, Save } from "lucide-react";
import api from "../../../../config/api"; // ✅ your axios instance

type Assistance = {
  _id?: string;
  category: string;
  shortDescription: string;
  description1: string;
  description2: string;
  buttonText: string;
};

const CATEGORIES = [
  "Startup Compliance",
  "Dispute Resolution",
  "Civil and Personal",
  "Miscellaneous Concerns",
  "Legal Initiatives",
];

export default function AssistancePage() {
  const [assistanceList, setAssistanceList] = useState<Assistance[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    [key: string]: {
      shortDescription: string;
      description1: string;
      description2: string;
      buttonText: string;
    };
  }>({});

  useEffect(() => {
    const fetchAssistance = async () => {
      try {
        const res = await api.get<Assistance[]>("/assistance");
        setAssistanceList(res.data || []);

        const mapped: Record<string, any> = {};
        res.data.forEach((item) => {
          mapped[item.category] = {
            shortDescription: item.shortDescription,
            description1: item.description1,
            description2: item.description2,
            buttonText: item.buttonText,
          };
        });

        setFormData(mapped);
      } catch (err) {
        console.error("Failed to fetch assistance sections:", err);
      }
    };

    fetchAssistance();
  }, []);

  const saveSection = async (category: string) => {
    const existing = assistanceList.find(
      (item) => item.category === category
    );

    const payload = {
      category,
      shortDescription: formData[category]?.shortDescription || "",
      description1: formData[category]?.description1 || "",
      description2: formData[category]?.description2 || "",
      buttonText: formData[category]?.buttonText || "",
    };

    try {
      let res;

      if (existing?._id) {
        res = await api.put<Assistance>(
          `/assistance/${existing._id}`,
          payload
        );

        setAssistanceList((prev) =>
          prev.map((item) =>
            item.category === category ? res.data : item
          )
        );
      } else {
        res = await api.post<Assistance>("/assistance", payload);
        setAssistanceList((prev) => [...prev, res.data]);
      }

      setEditingIndex(null);
    } catch (err) {
      console.error("Failed to save assistance section:", err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assistance Sections</CardTitle>
        <CardDescription>
          Manage 5 assistance categories
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {CATEGORIES.map((category, index) => {
            const isEditing = editingIndex === index;
            const existingData = formData[category];

            return (
              <div
                key={category}
                className="border rounded-lg p-4 bg-muted space-y-3"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <Label>Category</Label>
                    <p className="font-semibold">{category}</p>

                    <div>
                      <Label>Short Description</Label>
                      <Input
                        value={existingData?.shortDescription || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [category]: {
                              ...existingData,
                              shortDescription: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Description 1</Label>
                      <Input
                        value={existingData?.description1 || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [category]: {
                              ...existingData,
                              description1: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Description 2</Label>
                      <Input
                        value={existingData?.description2 || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [category]: {
                              ...existingData,
                              description2: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Button Text</Label>
                      <Input
                        value={existingData?.buttonText || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [category]: {
                              ...existingData,
                              buttonText: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Button onClick={() => saveSection(category)}>
                        <Save className="h-4 w-4 mr-2" /> Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingIndex(null)}
                      >
                        <X className="h-4 w-4 mr-2" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{category}</p>
                      {existingData?.shortDescription ? (
                        <>
                          <p className="text-sm mt-1">
                            {existingData.shortDescription}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Desc1: {existingData.description1}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Desc2: {existingData.description2}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Button: {existingData.buttonText}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm italic text-muted-foreground">
                          No data added
                        </p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setEditingIndex(index)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {existingData ? "Edit" : "Add"}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
