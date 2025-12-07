import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { TOPICS, CurriculumConfig } from "@/lib/types";
import { BookOpen, Calendar, Clock, Trophy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CurriculumConfigProps {
  config: CurriculumConfig;
  setConfig: (config: CurriculumConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

export function CurriculumConfiguration({ config, setConfig, onNext, onBack }: CurriculumConfigProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>(config.topics || []);

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => {
      const newTopics = prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic];
      
      setConfig({ ...config, topics: newTopics });
      return newTopics;
    });
  };

  const handleDurationChange = (value: number[]) => {
    setConfig({ ...config, durationMonths: value[0] });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-foreground">Curriculum Configuration</h2>
        <p className="text-muted-foreground">Customize the learning journey based on student needs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Structure */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Methodology</h3>
              </div>
              
              <RadioGroup 
                defaultValue="LPP" 
                onValueChange={(val) => setConfig({ ...config, methodology: val as 'LPP' })}
                className="grid grid-cols-1 gap-4"
              >
                <div>
                  <RadioGroupItem value="LPP" id="lpp" className="peer sr-only" />
                  <Label
                    htmlFor="lpp"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <div className="flex items-center gap-2 font-bold text-lg text-primary mb-2">
                      LPP Model
                    </div>
                    <div className="flex justify-between w-full text-sm text-center">
                      <div className="px-2">Learn</div>
                      <div className="text-muted-foreground">→</div>
                      <div className="px-2">Practice</div>
                      <div className="text-muted-foreground">→</div>
                      <div className="px-2">Perform</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-secondary" />
                  <h3 className="font-semibold text-lg">Class Frequency</h3>
                </div>
                
                <ToggleGroup 
                  type="single" 
                  value={config.classesPerWeek.toString()}
                  onValueChange={(val) => {
                    if (val) setConfig({ ...config, classesPerWeek: parseInt(val) as 3 | 5 });
                  }}
                  className="justify-start gap-4"
                >
                  <ToggleGroupItem 
                    value="3" 
                    className="h-12 px-6 border-2 data-[state=on]:border-secondary data-[state=on]:bg-secondary/10 data-[state=on]:text-secondary"
                  >
                    3 Classes / Week
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="5" 
                    className="h-12 px-6 border-2 data-[state=on]:border-secondary data-[state=on]:bg-secondary/10 data-[state=on]:text-secondary"
                  >
                    5 Classes / Week
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-secondary" />
                    <h3 className="font-semibold text-lg">Duration</h3>
                  </div>
                  <span className="text-2xl font-bold text-secondary">{config.durationMonths} Months</span>
                </div>
                
                <Slider
                  defaultValue={[config.durationMonths]}
                  min={3}
                  max={24}
                  step={1}
                  onValueChange={handleDurationChange}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>3 Months</span>
                  <span>12 Months</span>
                  <span>24 Months</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Topics */}
        <Card className="h-full">
          <CardContent className="pt-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="h-5 w-5 text-success" />
              <h3 className="font-semibold text-lg">Focus Areas & Topics</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 content-start">
              {TOPICS.map((topic) => (
                <div key={topic} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <Checkbox 
                    id={topic} 
                    checked={selectedTopics.includes(topic)}
                    onCheckedChange={() => handleTopicToggle(topic)}
                    className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                  />
                  <Label 
                    htmlFor={topic}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {topic}
                  </Label>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
               <div className="bg-success/10 text-success-foreground p-3 rounded-md text-sm font-medium text-center">
                 {selectedTopics.length} topics selected for {config.durationMonths} months
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} size="lg">Back</Button>
        <Button onClick={onNext} size="lg" className="bg-primary hover:bg-primary/90">
          Continue to Pricing
        </Button>
      </div>
    </div>
  );
}
