import React, { useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { useLanguage } from '../i18n';
import { Navbar } from '../components/navigation/Navbar';
import { NavigationTabs, HomeTab } from '../components/navigation/NavigationTabs';
import { StudentIdentityCard } from '../components/student/StudentIdentityCard';
import { ClassList } from '../components/classes/ClassList';
import { CreateClassForm } from '../components/classes/CreateClassForm';
import { ApplicationView } from '../components/applications/ApplicationView';
import { MyApplications } from '../components/applications/MyApplications';
import { Footer } from '../components/common/Footer';
import { Card } from '../components/ui/card';
import { Clock, ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { activeHoldId, setActiveHoldId } = useStudent();
  const { t } = useLanguage();
  const [currentTab, setCurrentTab] = useState<HomeTab>(() => (activeHoldId ? 'active-hold' : 'classes'));
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleHoldCreated = (newHoldId: string) => {
    setActiveHoldId(newHoldId);
    setCurrentTab('active-hold');
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSelectHold = (selectedHoldId: string) => {
    setActiveHoldId(selectedHoldId);
    setCurrentTab('active-hold');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      
      <Navbar />

      
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:px-6 space-y-6">
        
        
        <StudentIdentityCard />

        
        <NavigationTabs
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
        />

        
        {currentTab === 'classes' && (
          <div className="pt-1">
            <ClassList
              onHoldCreated={handleHoldCreated}
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}

        
        {currentTab === 'active-hold' && (
          <div className="pt-1">
            {activeHoldId ? (
              <ApplicationView
                holdId={activeHoldId}
                onStatusChange={() => {
                  setRefreshTrigger((prev) => prev + 1);
                }}
                onBackToClasses={() => setCurrentTab('classes')}
              />
            ) : (
              <Card className="border-dashed p-12 text-center shadow-none">
                <Clock className="w-14 h-14 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  {t.application.empty_active_title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                  {t.application.empty_active_sub}
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentTab('classes')}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    <span>{t.application.go_classes_btn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('my-holds')}
                    className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium rounded-xl transition-colors"
                  >
                    {t.application.go_my_holds_btn}
                  </button>
                </div>
              </Card>
            )}
          </div>
        )}

        
        {currentTab === 'my-holds' && (
          <div className="pt-1">
            <MyApplications
              onSelectHold={handleSelectHold}
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}

        
        {currentTab === 'create-class' && (
          <div className="pt-1">
            <CreateClassForm
              onClassCreated={() => {
                setRefreshTrigger((prev) => prev + 1);
              }}
            />
          </div>
        )}
      </main>

      
      <Footer />
    </div>
  );
};
