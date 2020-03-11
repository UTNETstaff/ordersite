from django import forms
from .models import *

class orderCreateForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(orderCreateForm, self).__init__(*args, **kwargs)
        if 'user' in kwargs['initial'].keys():
            syozoku_id = int(kwargs['initial']['user'])
            self.fields['department'].queryset = Bumon.objects.filter(syozoku=syozoku_id)
            self.fields['department_code'].queryset = DepCode.objects.filter(syozoku=syozoku_id)
            self.fields['budget_subject_code'].queryset = BudCode.objects.filter(syozoku=syozoku_id)
            self.fields['project_code'].queryset = ProCode.objects.filter(syozoku=syozoku_id)

            with open('/tmp/log','w') as f:
                f.write('sysoid '+str(syozoku_id))
    
    class Meta:
        model = Order
        fields = '__all__'
#        fields = ("nendo","bango","order_status","order_date","department",
#                  "orderer","phone","delivery_place","department_code",
#                  "budget_subject_code","project_code","item_name",
#                  "kikaku","suuryou","tanni","tanka","tanka_zei","kingaku",
#                  "kingaku_zei","suppliers","invoice_number","note")

        widgets = {
            'nendo': forms.TextInput(),
            'bango': forms.TextInput(attrs={'readonly': True}),
            'order_date': forms.DateInput(attrs={"type":"date"}),
            'item_name': forms.Textarea(attrs={'rows':4, 'cols':60}),
            'kikaku': forms.Textarea(attrs={'rows':4, 'cols':60}),
            'note': forms.Textarea(attrs={'rows':4, 'cols':60}),
            #'syozoku': forms.TextInput(attrs={'readonly': True}),
            'syozoku': forms.HiddenInput()
        }

class SearchForm(forms.Form):
    nendo = forms.CharField(
        initial='',
        label='年度',
        required = False, # 必須ではない
    )
    #item_name = forms.CharField(
    #    initial='',
    #    label='品名',
    #    required=False,  # 必須ではない
    #)

