import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Calendar, Clock, Users } from "lucide-react"
import { useState } from "react"

export default function DemoBooking() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    deviceType: "",
    teamSize: "",
    requirements: ""
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    alert("Demo Requested! Our team will contact you within 24 hours to schedule your personalized demo.")
    setFormData({
      name: "",
      email: "",
      company: "",
      phone: "",
      deviceType: "",
      teamSize: "",
      requirements: ""
    })
  }

  return (
    <section id="demo" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              See eRepairing.com in{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Action
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Book a personalized demo and discover how our platform can transform your helpdesk operations
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Demo Form */}
            <Card className="shadow-elegant">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-2 text-2xl">
                  <Calendar className="text-primary" size={28} />
                  <span>Book Your Demo</span>
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Get a customized demonstration tailored to your business needs
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base font-semibold">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="John Doe"
                        required
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base font-semibold">Business Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="john@company.com"
                        required
                        className="h-12 text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-base font-semibold">Company Name *</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        placeholder="Your Company"
                        required
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-base font-semibold">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+91 98765 43210"
                        className="h-12 text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="deviceType" className="text-base font-semibold">Primary Device Type</Label>
                      <Select value={formData.deviceType} onValueChange={(value) => setFormData({...formData, deviceType: value})}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select device type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="laptops">Laptops</SelectItem>
                          <SelectItem value="pcs">Desktop PCs</SelectItem>
                          <SelectItem value="servers">Servers</SelectItem>
                          <SelectItem value="cameras">Cameras</SelectItem>
                          <SelectItem value="iot">IoT Devices</SelectItem>
                          <SelectItem value="multiple">Multiple Types</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teamSize" className="text-base font-semibold">Support Team Size</Label>
                      <Select value={formData.teamSize} onValueChange={(value) => setFormData({...formData, teamSize: value})}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select team size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 engineers</SelectItem>
                          <SelectItem value="11-50">11-50 engineers</SelectItem>
                          <SelectItem value="51-200">51-200 engineers</SelectItem>
                          <SelectItem value="200+">200+ engineers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements" className="text-base font-semibold">Specific Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                      placeholder="Tell us about your current challenges and what you&apos;d like to see in the demo..."
                      rows={5}
                      className="text-base min-h-[120px]"
                    />
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full h-14 text-lg font-semibold mt-4">
                    Book Demo Now
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Demo Benefits */}
            <div className="space-y-8">
              <div className="bg-card p-6 rounded-xl shadow-elegant border">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="text-primary-foreground" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">30-Minute Focused Session</h3>
                    <p className="text-muted-foreground">
                      Tailored demonstration covering your specific use cases and requirements
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl shadow-elegant border">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="text-accent-foreground" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Expert Consultation</h3>
                    <p className="text-muted-foreground">
                      Get insights from our product experts on best practices and implementation
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl shadow-elegant border">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Flexible Scheduling</h3>
                    <p className="text-muted-foreground">
                      Choose a time that works for you - we accommodate all time zones
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-hero p-6 rounded-xl text-primary-foreground">
                <h3 className="text-lg font-semibold mb-2">What You&apos;ll See:</h3>
                <ul className="space-y-2 text-sm opacity-90">
                  <li>• Live AI triage in action</li>
                  <li>• Multi-level admin dashboards</li>
                  <li>• Mobile engineer app demo</li>
                  <li>• Real-time inventory tracking</li>
                  <li>• SLA monitoring & alerts</li>
                  <li>• Custom reporting features</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
