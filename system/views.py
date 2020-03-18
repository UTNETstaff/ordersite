from django.shortcuts import render
from django.views.generic import CreateView,ListView,UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.conf import settings
from django.forms import HiddenInput
from django.urls import reverse_lazy
from django.db.models import Q
import os,re
import openpyxl
from openpyxl.styles import Border, Side
from django.http import HttpResponse,Http404
from .models import *
from .forms import *

def konnendo():
    if timezone.now().month > 3:
        knd = timezone.now().year
    else:
        knd = timezone.now().year - 1
    return knd

def jinendo():
    if timezone.now().month > 3:
        jnd = timezone.now().year + 1
    else:
        jnd = timezone.now().year
    return jnd

class orderListView(LoginRequiredMixin,ListView):
    model = Order  # 全て表示する場合はこれだけで良い。
    def post(self, request, *args, **kwargs):
        form_value = [
            self.request.POST.get('nendo', None),
        ]
        request.session['form_value'] = form_value
        self.request.GET = self.request.GET.copy()
        self.request.GET.clear()
        return self.get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        nendo = konnendo()
        if 'form_value' in self.request.session:
            form_value = self.request.session['form_value']
            nendo = form_value[0]
        default_data = {'nendo': nendo}
        test_form = SearchForm(initial=default_data) # 検索フォーム
        context['test_form'] = test_form
        return context

    def get_queryset(self):
        condition_nendo = Q(nendo__exact=konnendo())
        condition_syozoku_id = Q(syozoku_id__exact=self.request.user.syozoku_id)
        if 'form_value' in self.request.session:
            form_value = self.request.session['form_value']
            nendo = form_value[0]

            if len(nendo) != 0 and nendo[0]:
                condition_nendo = Q(nendo__exact=nendo)
            return Order.objects.select_related().filter(condition_nendo & condition_syozoku_id).order_by('-bango')
        else:
            return Order.objects.select_related().filter(condition_nendo & condition_syozoku_id).order_by('-bango')

class orderCreateView(LoginRequiredMixin,CreateView):
    model = Order
    form_class = orderCreateForm
    success_url = reverse_lazy('system:list')
    
    def get(self,request,*args,**kwargs):

        n_last = Order.objects.filter(nendo = konnendo(),syozoku=request.user.syozoku).order_by('-bango').first()
        n_last = n_last.bango + 1 if n_last is not None else 1

        s = User.objects.filter(username=request.user.username).first()
        self.extra_context = { 'pagetitle' : '新規オーダー' ,'syozoku': s.syozoku }
        self.initial = { 'nendo': konnendo(),
                         'order_date': timezone.now(),
                         'orderer': request.user.last_name+request.user.first_name,
                         'bango': n_last,
                         'phone': request.user.tel,
                         'tanka_zei': 2,
                         'kingaku_zei': 1,
                         'syozoku': s.syozoku,
                         'syozoku_id': s.syozoku_id,
                         'user': s.syozoku_id,
        }
        kwargs.update({'syozoku_id': s.syozoku_id})

        return super().get(self,request,*args,**kwargs)

class orderCreate2View(LoginRequiredMixin,CreateView):
    model = Order
    form_class = orderCreateForm
    success_url = reverse_lazy('system:list')
    
    def get(self,request,*args,**kwargs):

        n_last = Order.objects.filter(nendo = jinendo(),syozoku=request.user.syozoku).order_by('-bango').first()
        n_last = n_last.bango + 1 if n_last is not None else 1
        s = User.objects.filter(username=request.user.username).first()
        self.extra_context = { 'pagetitle' : '新規オーダー' ,'syozoku': s.syozoku }

        self.initial = { 'nendo': jinendo(),
                         'order_date': timezone.now(),
                         'orderer': request.user.last_name+request.user.first_name,
                         'bango': n_last,
                         'phone': request.user.tel,
                         'tanka_zei': 2,
                         'kingaku_zei': 1,
                         'syozoku': s.syozoku,
                         'user': s.syozoku_id,
        }
#        kwargs.update({'user': s.syozoku_id})
        kwargs.update({'syozoku_id': s.syozoku_id})

        return super().get(self,request,*args,**kwargs)

class orderUpdateView(LoginRequiredMixin,UpdateView):
    model = Order
    form_class = orderCreateForm
    success_url = reverse_lazy('system:list')
    
    def get(self,request,*args,**kwargs):
        s = User.objects.filter(username=request.user.username).first()
        self.extra_context = { 'pagetitle' : 'オーダー情報編集','syozoku': s.syozoku }
        self.initial = {'user': s.syozoku_id}
        kwargs.update({'user': s.syozoku_id})

        return super().get(self,request,*args,**kwargs)

@login_required
def ExcelDownload(request,*args,**kwargs):
    order = Order.objects.filter(pk=kwargs['pk']).first()
    if order is None:
        raise Http404

    terms = {
        'A2': '（ ■ 未発注　・　□ 発注済 ）' if str(order.order_status) == '未発注' else '（ □ 未発注　・■　 発注済 ）',
        'B3':order.bango, 'B4': order.order_date,
        'B5': re.sub('<.*>','',str(order.department)),
        'B6': re.sub('.*<予算責任者: ','',str(order.department)).replace('>',''),
        'B7': order.orderer, 'B8': order.phone, 'B9': order.delivery_place,
        'C10': str(order.department_code).split(',')[1],
        'E10': str(order.department_code).split(',')[0],
        #'C10': str(order.department_code).split(',')[0],'E10': str(order.department_code).split(',')[1],
        'C11': str(order.budget_subject_code).split(',')[1],
        'E11': str(order.budget_subject_code).split(',')[0],
        #'C11': str(order.budget_subject_code).split(',')[0],'E11': str(order.budget_subject_code).split(',')[1],
        'C12': str(order.project_code).split(',')[1],
        'E12': str(order.project_code).split(',')[0],
        #'C12': str(order.project_code).split(',')[0],'E12': str(order.project_code).split(',')[1],
        'B13': order.item_name,'B14': order.kikaku, 'B15': str(order.suuryou)+str(order.tanni),
        'B16': '{0:,}'.format(order.tanka)+'円('+str(order.tanka_zei)+')',
        'B17': '{0:,}円({1})'.format(order.kingaku,order.kingaku_zei),
        'B18': order.suppliers, 'B19': order.invoice_number,'B20': order.note,
    }
    wb = openpyxl.load_workbook(os.path.join(settings.DJANGO_ROOT,'static','order.xlsx'))

    sheet = wb['購入依頼(発注)書']
    for k,v in terms.items():
        sheet[k] = v

    ############ Draw border lines ############
    for rows in sheet['A3:E20']:
        for c in rows:
            c.border = Border(
                outline = True,
                left   = Side(style='thin',color='000000'),
                right  = Side(style='thin',color='000000'),
                top    = Side(style='thin',color='000000'),
                bottom = Side(style='thin',color='000000'),
    )    
    
    response = HttpResponse(content_type="application/ms-excel")
    response['Content-Disposition'] = 'inline; filename=' + 'order0.xlsx'

    wb.save(response)

    return response

