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
  Plus,
  Edit,
  Trash2,
} from "@/components/ui/index";
import api from "../../../../config/api"; 

type Contact = {
  _id?: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactHours: string;
  submissionEmail: string;
  lastUpdated?: string;
};

export default function ContactUs() {
  const [contact, setContact] = useState<Contact | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [contactHours, setContactHours] = useState("");
  const [submissionEmail, setSubmissionEmail] = useState("");

  // Fetch contact info
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await api.get<Contact | null>("/contactus");

        if (res.data) {
          setContact(res.data);
          setContactEmail(res.data.contactEmail);
          setContactPhone(res.data.contactPhone);
          setContactAddress(res.data.contactAddress);
          setContactHours(res.data.contactHours);
          setSubmissionEmail(res.data.submissionEmail);
        } else {
          setContact(null);
        }
      } catch (err) {
        console.error("Failed to fetch contact settings:", err);
      }
    };

    fetchContact();
  }, []);

  // Save or update
  const saveContact = async () => {
    const payload = {
      contactEmail,
      contactPhone,
      contactAddress,
      contactHours,
      submissionEmail,
    };

    try {
      let res;

      if (contact?._id) {
        res = await api.put<Contact>(
          `/contactus/${contact._id}`,
          payload
        );
      } else {
        res = await api.post<Contact>("/contactus", payload);
      }

      setContact(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save contact settings:", err);
    }
  };

  // Delete
  const deleteContact = async () => {
    if (!contact?._id) {
      setContact(null);
      return;
    }

    try {
      await api.delete(`/contactus/${contact._id}`);
      setContact(null);
    } catch (err) {
      console.error("Failed to delete contact settings:", err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Us Section</CardTitle>
        <CardDescription>
          Manage contact information and settings
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {!contact ? (
            /* Create mode */
            <div className="space-y-4">
              <div>
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  placeholder="contact@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>

              <div>
                <Label>Contact Phone</Label>
                <Input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>

              <div>
                <Label>Contact Address</Label>
                <Textarea
                  className="min-h-[100px]"
                  placeholder="Enter contact address"
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                />
              </div>

              <div>
                <Label>Contact Hours</Label>
                <Input
                  placeholder="Mon–Fri, 9:00 AM – 6:00 PM"
                  value={contactHours}
                  onChange={(e) => setContactHours(e.target.value)}
                />
              </div>

              <Button onClick={saveContact}>
                <Plus className="h-4 w-4 mr-2" />
                Save Contact Settings
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg p-6 space-y-4 bg-muted">
              {isEditing ? (
                /* Edit mode */
                <div className="space-y-4">
                  <div>
                    <Label>Contact Email</Label>
                    <Input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Contact Phone</Label>
                    <Input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Contact Address</Label>
                    <Textarea
                      className="min-h-[100px]"
                      value={contactAddress}
                      onChange={(e) => setContactAddress(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Contact Hours</Label>
                    <Input
                      value={contactHours}
                      onChange={(e) => setContactHours(e.target.value)}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={saveContact}>Save Changes</Button>
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
                      Contact Email
                    </Label>
                    <p className="mt-1">{contact.contactEmail}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">
                      Contact Phone
                    </Label>
                    <p className="mt-1">{contact.contactPhone}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">
                      Contact Address
                    </Label>
                    <p className="mt-1 whitespace-pre-line">
                      {contact.contactAddress}
                    </p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">
                      Contact Hours
                    </Label>
                    <p className="mt-1">{contact.contactHours}</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" onClick={deleteContact}>
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
